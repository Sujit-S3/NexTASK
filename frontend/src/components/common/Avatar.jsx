import { getInitials } from '../../utils/formatters';

const SIZES = {
  xs:  { outer: 'w-6 h-6',   text: 'text-[10px]' },
  sm:  { outer: 'w-8 h-8',   text: 'text-xs'     },
  md:  { outer: 'w-10 h-10', text: 'text-sm'      },
  lg:  { outer: 'w-12 h-12', text: 'text-base'    },
  xl:  { outer: 'w-16 h-16', text: 'text-xl'      },
  '2xl': { outer: 'w-20 h-20', text: 'text-2xl'   },
};

const COLORS = [
  'from-brand-500 to-violet-500',
  'from-blue-500  to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-pink-500  to-rose-500',
  'from-indigo-500 to-brand-500',
];

function getColor(name = '') {
  const idx = name.charCodeAt(0) % COLORS.length;
  return COLORS[idx];
}

export default function Avatar({ name = '', src, size = 'md', className = '' }) {
  const { outer, text } = SIZES[size] || SIZES.md;
  const initials = getInitials(name);
  const color    = getColor(name);

  return (
    <div className={`${outer} rounded-xl overflow-hidden shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${color} font-semibold text-white ${text}`}>
          {initials}
        </div>
      )}
    </div>
  );
}
