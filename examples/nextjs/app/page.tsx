import { AnsiHtml } from 'fancy-ansi/react';

import { ThemeChanger } from '@/components/ThemeChanger';

export default function Home() {
  const ansiStr1 = '\x1b[1mThis is in bold\x1b[0m';
  const ansiStr2 = '\x1b[3mThis is in italics\x1b[0m';
  const ansiStr3 = '\x1b[31mThis is in red\x1b[0m';

  return (
    <div className="p-2">
      <div className="mb-2">
        <label className="mr-1">Theme:</label>
        <ThemeChanger />
      </div>
      <div>
        <ul className="list-disc pl-4">
          <li><AnsiHtml text={ansiStr1} /></li>
          <li><AnsiHtml text={ansiStr2} /></li>
          <li><AnsiHtml text={ansiStr3} /></li>
        </ul>
      </div>
    </div>
  );
}
