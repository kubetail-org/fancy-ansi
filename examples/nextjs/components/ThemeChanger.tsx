'use client';

export const ThemeChanger = () => {
  const handleThemeChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
    if (ev.target.value === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  return (
    <select defaultValue="light" onChange={handleThemeChange}>
      <option>light</option>
      <option>dark</option>
    </select>
  );
};
