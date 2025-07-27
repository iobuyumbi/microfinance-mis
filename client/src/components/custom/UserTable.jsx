import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Badge,
} from "@/components/ui";
import {
  Edit,
  Trash2,
  User as UserOutline,
  Mail,
  Shield,
  Activity,
  Loader2,
} from "lucide-react";

export default function UserTable({
  users,
  loading,
  onEdit,
  onDelete,
  deletingUserId,
}) {
  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex items-center">
              <UserOutline className="h-4 w-4 mr-2" /> Name
            </TableHead>
            <TableHead className="flex items-center">
              <Mail className="h-4 w-4 mr-2" /> Email
            </TableHead>
            <TableHead className="flex items-center">
              <Shield className="h-4 w-4 mr-2" /> Role
            </TableHead>
            <TableHead className="flex items-center">
              <Activity className="h-4 w-4 mr-2" /> Status
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-1/3"></div>
              </TableCell>
              <TableCell>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </TableCell>
              <TableCell className="text-right">
                <div className="h-4 bg-muted rounded w-1/2 ml-auto"></div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (users.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="flex items-center">
              <UserOutline className="h-4 w-4 mr-2" /> Name
            </TableHead>
            <TableHead className="flex items-center">
              <Mail className="h-4 w-4 mr-2" /> Email
            </TableHead>
            <TableHead className="flex items-center">
              <Shield className="h-4 w-4 mr-2" /> Role
            </TableHead>
            <TableHead className="flex items-center">
              <Activity className="h-4 w-4 mr-2" /> Status
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              colSpan={5}
              className="text-center py-4 text-muted-foreground"
            >
              No users found.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="flex items-center">
            <UserOutline className="h-4 w-4 mr-2" /> Name
          </TableHead>
          <TableHead className="flex items-center">
            <Mail className="h-4 w-4 mr-2" /> Email
          </TableHead>
          <TableHead className="flex items-center">
            <Shield className="h-4 w-4 mr-2" /> Role
          </TableHead>
          <TableHead className="flex items-center">
            <Activity className="h-4 w-4 mr-2" /> Status
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id || user._id}>
            <TableCell className="font-medium">{user.name || "-"}</TableCell>
            <TableCell>{user.email || "-"}</TableCell>
            <TableCell>
              <Badge variant="secondary" className="capitalize">
                {user.role || "-"}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                className={`capitalize ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : user.status === "inactive"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                }`}
              >
                {user.status || "-"}
              </Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(user)}
                className="p-0 h-auto mr-2"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800"
                onClick={() => onDelete(user._id || user.id)}
                disabled={deletingUserId === (user.id || user._id)}
              >
                {deletingUserId === (user.id || user._id) ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
