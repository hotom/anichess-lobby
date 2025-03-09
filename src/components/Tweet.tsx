'use client';

import { formatDistanceToNow } from 'date-fns';

interface TweetProps {
  data: {
    id: string;
    body: string;
    createdAt: string;
    user: {
      username: string;
      name: string;
    };
  };
}

const Tweet: React.FC<TweetProps> = ({ data }) => {
  return (
    <div className="border-b-[1px] border-neutral-800 p-5 cursor-pointer hover:bg-neutral-900 transition">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-white font-semibold">{data.user.name}</p>
          <span className="text-neutral-500">@{data.user.username}</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-500">
            {formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="text-white mt-1">{data.body}</div>
      </div>
    </div>
  );
};

export default Tweet; 