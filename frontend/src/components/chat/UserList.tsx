import { User } from "@/types";
import Image from "next/image";

interface UserListProps {
  users: User[];
  onSelectUser: (user: User) => void;
}

export default function UserList({ users, onSelectUser }: UserListProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Available Users</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select a user to start chatting
        </p>
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
              className="w-full p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-100"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
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
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.username}
                </p>
                <p className="text-xs text-gray-500">
                  Click to start conversation
                </p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
