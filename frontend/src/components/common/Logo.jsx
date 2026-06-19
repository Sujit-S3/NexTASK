import logoIcon from '../../assets/logo-icon.png';
import logoWide from '../../assets/logo-wide.png';

export default function Logo({ size = 32, className = '', variant = 'icon' }) {
  const isWide = variant === 'wide';

  return (
    <img
      src={isWide ? logoWide : logoIcon}
      alt="NexTASK logo"
      height={size}
      className={className}
      style={{ 
        height: `${size}px`, 
        width: 'auto',
        borderRadius: isWide ? '0' : '30%', 
      }}
      draggable={false}
    />
  );
}
