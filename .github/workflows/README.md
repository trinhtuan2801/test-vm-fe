# How to add a deploy job

`deploy.yml` SSHes from GitHub Actions into a GCloud VM and runs a build script that already lives on that VM. Each VM is its own job. Jobs do not share a shell, so env names inside a job stay the same. Secret names carry that id, because GitHub secrets belong to the repository, not to a job.

`deploy-VM1` and `deploy-VM2` are the pattern. Copy one of them when you add another VM.

Do not edit this document after adding a job. New jobs go only in `deploy.yml`. The examples above stay as the pattern.

## 1. Create the secrets

In the repo: **Settings → Secrets and variables → Actions → New repository secret**.

Pick any short uppercase id that is not already used, such as `VM1`. The same id goes on the job, the secrets, the key files, and the error text. Below, that id is written `<ID>`. Create all five:

| Secret | What to put in it |
| --- | --- |
| `<ID>_SSH_KEY` | Private key the workflow uses to log in. One line is not enough; paste the whole key, including the `BEGIN` and `END` lines. |
| `<ID>_KNOWN_HOSTS` | One `known_hosts` line for that VM, so SSH can verify the host. |
| `<ID>_HOST` | IP or hostname, for example `34.0.0.1`. |
| `<ID>_USER` | SSH user on the VM, for example `deploy`. |
| `<ID>_BUILD_SCRIPT` | Path of the build script **on the VM**. `~/scripts/build.sh` is fine. |

On your machine, the host line is:

```bash
ssh-keyscan -H <host>
```

Paste that output into `<ID>_KNOWN_HOSTS`.

On the VM, append the matching **public** key to that user's `~/.ssh/authorized_keys`. The private key stays only in `<ID>_SSH_KEY`.

## 2. Copy a job

In `.github/workflows/deploy.yml`, duplicate the whole `deploy-VM1:` (or `deploy-VM2:`) block, including both steps. Keep it under `jobs:`, as a sibling of the existing jobs.

Then change only these spots. Env names (`SSH_KEY`, `KNOWN_HOSTS`, `HOST`, `USER`, `BUILD_SCRIPT`) stay as they are.

| In the copied job | Change it to |
| --- | --- |
| Job id, `deploy-VM1` | `deploy-<ID>` |
| Step titles, `Configure SSH for VM1` and `Deploy to VM1` | the same `<ID>` |
| `secrets.VM1_SSH_KEY` and the other four `secrets.VM1_*` | `secrets.<ID>_*` |
| `~/.ssh/VM1_deploy_key` and `~/.ssh/VM1_known_hosts` | `~/.ssh/<ID>_deploy_key` and `~/.ssh/<ID>_known_hosts`, in both steps |
| `Build script not found on VM1.` | the same `<ID>` |

A new job looks like this. Replace every `<ID>` with the uppercase id you picked:

```yaml
  deploy-<ID>:
    runs-on: ubuntu-latest
    steps:
      - name: Configure SSH for <ID>
        env:
          SSH_KEY: ${{ secrets.<ID>_SSH_KEY }}
          KNOWN_HOSTS: ${{ secrets.<ID>_KNOWN_HOSTS }}
        run: |
          mkdir -p ~/.ssh
          chmod 700 ~/.ssh

          printf '%s\n' "$SSH_KEY" > ~/.ssh/<ID>_deploy_key
          chmod 600 ~/.ssh/<ID>_deploy_key

          printf '%s\n' "$KNOWN_HOSTS" > ~/.ssh/<ID>_known_hosts
          chmod 600 ~/.ssh/<ID>_known_hosts

      - name: Deploy to <ID>
        env:
          HOST: ${{ secrets.<ID>_HOST }}
          USER: ${{ secrets.<ID>_USER }}
          BUILD_SCRIPT: ${{ secrets.<ID>_BUILD_SCRIPT }}
        run: |
          raw_path="$(printf '%s' "$BUILD_SCRIPT" | tr -d '\r' | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
          quoted_path="$(printf '%q' "$raw_path")"

          ssh -i ~/.ssh/<ID>_deploy_key \
            -o IdentitiesOnly=yes \
            -o UserKnownHostsFile=~/.ssh/<ID>_known_hosts \
            "$USER@$HOST" \
            "bash -s -- $quoted_path" <<'REMOTE'
          set -euo pipefail

          script="$1"
          case "$script" in
            "~/"*) script="$HOME/${script#\~/}" ;;
          esac

          if [ ! -f "$script" ]; then
            echo "Build script not found on <ID>." >&2
            echo "  remote user : $(whoami)" >&2
            echo "  remote home : $HOME" >&2
            echo "  script name : $(basename -- "$script")" >&2
            dir="$(dirname -- "$script")"
            if [ -d "$dir" ]; then
              echo "  parent directory exists, contents:" >&2
              ls -la -- "$dir" >&2
            else
              echo "  parent directory does not exist either" >&2
            fi
            exit 1
          fi

          bash "$script"
          REMOTE
```

Leave the `<<'REMOTE'` quotes in place. They stop the runner from expanding `$1` and `$HOME` locally. Those variables run on the VM.

## 3. Run it

Push to `main`, or open **Actions → Deploy to GCloud VMs → Run workflow**. Jobs in this file start together. A failed VM does not cancel the others unless you add `needs:`.

If the deploy step says the build script was not found, the log prints the remote user, home directory, script name, and the parent directory listing. Check `<ID>_BUILD_SCRIPT` and that the file exists for `<ID>_USER`.
