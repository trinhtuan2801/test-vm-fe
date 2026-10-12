import { NavLink } from 'react-router';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
];

const VERSION = '6';

export default function Navbar() {
  return (
    <header className='border-b border-slate-200 bg-white'>
      <nav className='mx-auto flex max-w-3xl items-center gap-6 px-4 py-4'>
        <span className='font-semibold'>Version {VERSION}</span>
        <ul className='flex gap-4 text-sm'>
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end
                className={({ isActive }) =>
                  isActive ? 'font-medium text-blue-600' : 'text-slate-600 hover:text-slate-900'
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
