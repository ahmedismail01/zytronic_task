import { User } from "@/types";
import Image from "next/image";

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

export default function UserList({ users, onSelectUser }: UserListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-2 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Users</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No other users available</p>
          </div>
        ) : (
          users.map((user) => (
            <button
              key={user._id}
              onClick={() => onSelectUser(user)}
              className="w-full p-2 flex items-center space-x-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium justify-start flex text-gray-900 truncate">
                  {user.username}
                </p>
              </div>
              <div
                className={`w-2 h-2 ${
                  user.online ? "bg-green-500" : "bg-gray-400"
                } rounded-full`}
              ></div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
