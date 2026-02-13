import { useState } from "react";
import { AdminLayout } from "../../components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Switch } from "../../components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { UserPlus, Users } from "lucide-react";

interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  goldHoldings: number;
  status: boolean;
}

export function AdminMembers() {
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234-567-8901", goldHoldings: 125.5, status: true },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1 234-567-8902", goldHoldings: 89.3, status: true },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "+1 234-567-8903", goldHoldings: 203.7, status: true },
    { id: 4, name: "Alice Williams", email: "alice@example.com", phone: "+1 234-567-8904", goldHoldings: 156.2, status: false },
    { id: 5, name: "Charlie Brown", email: "charlie@example.com", phone: "+1 234-567-8905", goldHoldings: 78.9, status: true },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const toggleMemberStatus = (id: number) => {
    setMembers(members.map(member =>
      member.id === id ? { ...member, status: !member.status } : member
    ));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const member: Member = {
      id: members.length + 1,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      goldHoldings: 0,
      status: true,
    };
    setMembers([...members, member]);
    setNewMember({ name: "", email: "", phone: "" });
    setIsDialogOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl">Member Management</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-12 px-8">
                <UserPlus className="w-5 h-5 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
                <DialogDescription>Enter the details of the new member</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMember} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12">Add Member</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6" />
              Members List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Gold Holdings</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.id}</TableCell>
                      <TableCell>{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.goldHoldings.toFixed(1)}g</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={member.status}
                            onCheckedChange={() => toggleMemberStatus(member.id)}
                          />
                          <span className={member.status ? "text-green-600" : "text-gray-400"}>
                            {member.status ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
