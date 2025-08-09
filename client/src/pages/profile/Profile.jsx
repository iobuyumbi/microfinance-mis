import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <div>Loading profile...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-card rounded shadow p-6 max-w-md">
        <div className="mb-2">
          <span className="font-semibold">Name:</span> {user.name}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Email:</span> {user.email}
        </div>
        <div className="mb-2">
          <span className="font-semibold">Role:</span> {user.role}
        </div>
      </div>
    </div>
  );
}
