import { useEffect, useState } from "react";
import { groupService } from "../../services/api";
import Table from "../../components/Table";
import { toast } from "sonner";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = () => {
    setLoading(true);
    groupService
      .getAllGroups()
      .then((data) => setGroups(data.groups || []))
      .catch(() => toast.error("Failed to load groups"))
      .finally(() => setLoading(false));
  };

  const handleAddGroup = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await groupService.createGroup(newGroup);
      toast.success("Group added!");
      setModalOpen(false);
      setNewGroup({ name: "", description: "" });
      fetchGroups();
    } catch {
      toast.error("Failed to add group");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button>Add Group</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add New Group</DialogTitle>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup((g) => ({ ...g, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup((g) => ({ ...g, description: e.target.value }))
                  }
                />
              </div>
              <Button type="submit" disabled={adding} className="w-full">
                {adding ? "Adding..." : "Add Group"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "description", label: "Description" },
            ]}
            data={groups}
          />
        )}
      </CardContent>
    </Card>
  );
}
