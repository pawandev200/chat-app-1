// import { IoSearchSharp } from "react-icons/io5";

import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";

const SearchInput = ({ setSelectedUser }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { users } = useChatStore();  // Fetching the users from the store

  // UseEffect to reset the search query and handle any other side effects if needed
  useEffect(() => {
    setSearchQuery("");
  }, []);

  // Handle change of search query
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter users based on the search query
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Enter key press to select the first filtered user
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && filteredUsers.length > 0) {
      setSelectedUser(filteredUsers[0]); // Select the first user from the filtered results
      setSearchQuery(""); // Clear the search query
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyDown={handleKeyPress} // Listen for Enter key press
        placeholder="Search users..."
        className="w-full p-2 rounded-lg border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {/* Conditionally display the filtered results */}
      {searchQuery && (
        <div className="absolute w-full bg-white border border-base-300 mt-1 rounded-lg max-h-60 overflow-y-auto shadow-lg z-10">
          {filteredUsers.length === 0 ? (
            <div className="text-center p-2 text-sm text-zinc-500">No users found</div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => {
                  setSelectedUser(user); // Select the clicked user
                  setSearchQuery(""); // Clear the search query
                }}
                className="p-2 hover:bg-base-100 cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="w-8 h-8 object-cover rounded-full"
                  />
                  <span className="text-sm font-medium">{user.fullName}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
