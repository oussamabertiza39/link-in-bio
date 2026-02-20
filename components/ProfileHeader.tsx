import Image from 'next/image';

interface Props {
  name?: string | null;
  username: string;
  bio?: string | null;
  avatar?: string | null;
}

export function ProfileHeader({ name, username, bio, avatar }: Props) {
  return (
    <header className="flex flex-col items-center gap-3 text-center">
      {avatar ? <Image src={avatar} alt={username} width={96} height={96} className="h-24 w-24 rounded-full object-cover" /> : <div className="h-24 w-24 rounded-full bg-muted" />}
      <h1 className="text-xl font-semibold">{name || `@${username}`}</h1>
      {bio ? <p className="max-w-md text-sm text-slate-300">{bio}</p> : null}
    </header>
  );
}
