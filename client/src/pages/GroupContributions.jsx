import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// ShadCN UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Icons
import {
  Users,
  Plus,
  Download,
  Upload,
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  UserPlus,
  FileText,
  BarChart3,
  Search,
  Filter,
} from "lucide-react";

// Custom Components
import { PageLayout } from "@/components/layouts/PageLayout";
import { DataTable } from "@/components/custom/DataTable";
import { LoadingSpinner } from "@/components/custom/LoadingSpinner";

// Validation schema
const contributionSchema = z.object({
  memberName: z.string().min(2, "Member name must be at least 2 characters"),
  principal: z.number().min(0, "Principal must be positive"),
  june: z.number().min(0, "June contribution must be positive"),
  july: z.number().min(0, "July contribution must be positive"),
  august: z.number().min(0, "August contribution must be positive"),
  december: z.number().min(0, "December contribution must be positive"),
  year: z.string().min(1, "Year is required"),
  period: z.string().min(1, "Period is required"),
  actualContribution: z.number().min(0, "Actual contribution must be positive"),
});

export default function GroupContributions() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");

  const form = useForm({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      memberName: "",
      principal: 0,
      june: 0,
      july: 0,
      august: 0,
      december: 0,
      year: "",
      period: "",
      actualContribution: 0,
    },
  });

  useEffect(() => {
    loadContributions();
  }, []);

  const loadContributions = async () => {
    try {
      setLoading(true);
      // Mock data based on your example - replace with actual API call
      const mockData = [
        {
          id: 1,
          memberName: "Isaac Musungu",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "Year 1",
          period: "Year 1",
          actualContribution: 8526.0,
        },
        {
          id: 2,
          memberName: "Wilfrida Hongo",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "Year 2",
          period: "Year 2",
          actualContribution: 0,
        },
        {
          id: 3,
          memberName: "Hudson Nyongesa",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "Year 3",
          period: "Year 3",
          actualContribution: 0,
        },
        {
          id: 4,
          memberName: "Tabitha Musungu",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "Year 4",
          period: "Year 4",
          actualContribution: 0,
        },
        {
          id: 5,
          memberName: "Richard Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "Year 5",
          period: "Year 5",
          actualContribution: 0,
        },
        {
          id: 6,
          memberName: "Elcah Sifuna",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 7,
          memberName: "Eric Musungu",
          principal: 115.0,
          june: 115.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 215.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 8,
          memberName: "Vennah Omweri",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 9,
          memberName: "Onsemus Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 10,
          memberName: "Jentrix Chibole",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 11,
          memberName: "Everlyn Nelima",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 100.0,
          december: 0,
          total: 300.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 12,
          memberName: "Jemmimah Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 100.0,
          december: 0,
          total: 300.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 13,
          memberName: "Victor Kombo",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 14,
          memberName: "Levis Biketi",
          principal: 111.0,
          june: 111.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 211.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 15,
          memberName: "Adelide Muyonga",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 16,
          memberName: "Dalvin Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 17,
          memberName: "Vivian Njeri",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 18,
          memberName: "Dotty Namwaya",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 19,
          memberName: "Sunil Nyongesa",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 20,
          memberName: "Reignard Bonke",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 21,
          memberName: "Teddy (Junior) Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 22,
          memberName: "Martin Musungu",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 23,
          memberName: "Jan Muindi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 24,
          memberName: "Violet Achema",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 25,
          memberName: "Josphat Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 26,
          memberName: "Faith Arir",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 27,
          memberName: "Collins Manyonge",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 28,
          memberName: "Jeremiah Simiyu",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 29,
          memberName: "Emily Wanjala",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 30,
          memberName: "Jane Wanjala",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 31,
          memberName: "Mirriam Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 32,
          memberName: "Sheila Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 33,
          memberName: "Teddy Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 100.0,
          december: 0,
          total: 300.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 34,
          memberName: "Nixon Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 35,
          memberName: "Eldah Nanjowe",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 36,
          memberName: "Glorious Namwaya",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 37,
          memberName: "Joy Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 38,
          memberName: "Angela Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 39,
          memberName: "Hope Biketi",
          principal: 100.0,
          june: 100.0,
          july: 100.0,
          august: 0,
          december: 0,
          total: 200.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 40,
          memberName: "Billian Biketi",
          principal: 100.0,
          june: 100.0,
          july: 0,
          august: 0,
          december: 0,
          total: 100.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 41,
          memberName: "Nahashon Biketi",
          principal: 100.0,
          june: 100.0,
          july: 0,
          august: 0,
          december: 0,
          total: 100.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 42,
          memberName: "Moses Biketi",
          principal: 100.0,
          june: 100.0,
          july: 0,
          august: 0,
          december: 0,
          total: 100.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 43,
          memberName: "Judith Biketi",
          principal: 100.0,
          june: 100.0,
          july: 0,
          august: 0,
          december: 0,
          total: 100.0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 44,
          memberName: "Obed Biketi",
          principal: 0,
          june: 0,
          july: 0,
          august: 0,
          december: 0,
          total: 0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 45,
          memberName: "Lilian Musungu",
          principal: 0,
          june: 0,
          july: 0,
          august: 0,
          december: 0,
          total: 0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 46,
          memberName: "Lucas Khaemba",
          principal: 0,
          june: 0,
          july: 0,
          august: 0,
          december: 0,
          total: 0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 47,
          memberName: "Sharon Nekesa",
          principal: 0,
          june: 0,
          july: 0,
          august: 0,
          december: 0,
          total: 0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 48,
          memberName: "Hezron Ngera",
          principal: 0,
          june: 0,
          july: 0,
          august: 0,
          december: 0,
          total: 0,
          year: "",
          period: "",
          actualContribution: 0,
        },
        {
          id: 49,
          memberName: "Emanuel Ngera",
          principal: 0,
          june: 0,
          july: 0,
          august: 0,
          december: 0,
          total: 0,
          year: "",
          period: "",
          actualContribution: 0,
        },
      ];
      setContributions(mockData);
    } catch (error) {
      toast.error("Failed to load contributions");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContribution = async (data) => {
    try {
      const newContribution = {
        id: contributions.length + 1,
        ...data,
        total: data.june + data.july + data.august + data.december,
      };
      setContributions((prev) => [...prev, newContribution]);
      toast.success("Contribution added successfully");
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to add contribution");
    }
  };

  const handleUpdateContribution = async (data) => {
    try {
      const updatedContribution = {
        ...selectedContribution,
        ...data,
        total: data.june + data.july + data.august + data.december,
      };
      setContributions((prev) =>
        prev.map((cont) =>
          cont.id === selectedContribution.id ? updatedContribution : cont
        )
      );
      toast.success("Contribution updated successfully");
      setIsEditDialogOpen(false);
      setSelectedContribution(null);
      form.reset();
    } catch (error) {
      toast.error("Failed to update contribution");
    }
  };

  const openEditDialog = (contribution) => {
    setSelectedContribution(contribution);
    form.reset({
      memberName: contribution.memberName,
      principal: contribution.principal,
      june: contribution.june,
      july: contribution.july,
      august: contribution.august,
      december: contribution.december,
      year: contribution.year,
      period: contribution.period,
      actualContribution: contribution.actualContribution,
    });
    setIsEditDialogOpen(true);
  };

  // Calculate totals
  const totalPrincipal = contributions.reduce(
    (sum, cont) => sum + cont.principal,
    0
  );
  const totalJune = contributions.reduce((sum, cont) => sum + cont.june, 0);
  const totalJuly = contributions.reduce((sum, cont) => sum + cont.july, 0);
  const totalAugust = contributions.reduce((sum, cont) => sum + cont.august, 0);
  const totalDecember = contributions.reduce(
    (sum, cont) => sum + cont.december,
    0
  );
  const grandTotal = contributions.reduce((sum, cont) => sum + cont.total, 0);
  const totalActualContribution = contributions.reduce(
    (sum, cont) => sum + cont.actualContribution,
    0
  );

  // Filter contributions based on search and year
  const filteredContributions = contributions.filter((cont) => {
    const matchesSearch = cont.memberName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === "all" || cont.year === selectedYear;
    return matchesSearch && matchesYear;
  });

  if (loading) {
    return (
      <PageLayout title="Group Contributions">
        <LoadingSpinner />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Group Contributions"
      action={
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Member Contribution</DialogTitle>
                <DialogDescription>
                  Add a new member and their contribution details
                </DialogDescription>
              </DialogHeader>
              <ContributionForm
                form={form}
                onSubmit={handleCreateContribution}
                submitLabel="Add Member"
              />
            </DialogContent>
          </Dialog>
        </div>
      }
    >
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Principal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalPrincipal.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {contributions.length} members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contributions
            </CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${grandTotal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              June: ${totalJune.toFixed(2)} | July: ${totalJuly.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Actual Contributions
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalActualContribution.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Including interest earned
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Interest Earned
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$28.00</div>
            <p className="text-xs text-muted-foreground">Current period</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="Year 1">Year 1</SelectItem>
                <SelectItem value="Year 2">Year 2</SelectItem>
                <SelectItem value="Year 3">Year 3</SelectItem>
                <SelectItem value="Year 4">Year 4</SelectItem>
                <SelectItem value="Year 5">Year 5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contributions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Member Contributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">June</TableHead>
                  <TableHead className="text-right">July</TableHead>
                  <TableHead className="text-right">August</TableHead>
                  <TableHead className="text-right">December</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">
                    Actual Contribution
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContributions.map((contribution) => (
                  <TableRow key={contribution.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {contribution.memberName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {contribution.memberName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${contribution.principal.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${contribution.june.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${contribution.july.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${contribution.august.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${contribution.december.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      ${contribution.total.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={contribution.year ? "default" : "secondary"}
                      >
                        {contribution.year || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={contribution.period ? "default" : "secondary"}
                      >
                        {contribution.period || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${contribution.actualContribution.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(contribution)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedContribution && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Member Contribution</DialogTitle>
              <DialogDescription>
                Update member contribution details
              </DialogDescription>
            </DialogHeader>
            <ContributionForm
              form={form}
              onSubmit={handleUpdateContribution}
              submitLabel="Update Member"
            />
          </DialogContent>
        </Dialog>
      )}
    </PageLayout>
  );
}

// Contribution Form Component
const ContributionForm = ({ form, onSubmit, submitLabel }) => {
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Member Name</label>
          <Input
            {...form.register("memberName")}
            placeholder="Enter member name"
          />
          {form.formState.errors.memberName && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.memberName.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Principal</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("principal", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {form.formState.errors.principal && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.principal.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="text-sm font-medium">June</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("june", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {form.formState.errors.june && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.june.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">July</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("july", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {form.formState.errors.july && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.july.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">August</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("august", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {form.formState.errors.august && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.august.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">December</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("december", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {form.formState.errors.december && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.december.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Year</label>
          <Select onValueChange={(value) => form.setValue("year", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Year 1">Year 1</SelectItem>
              <SelectItem value="Year 2">Year 2</SelectItem>
              <SelectItem value="Year 3">Year 3</SelectItem>
              <SelectItem value="Year 4">Year 4</SelectItem>
              <SelectItem value="Year 5">Year 5</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.year && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.year.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Period</label>
          <Select onValueChange={(value) => form.setValue("period", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Year 1">Year 1</SelectItem>
              <SelectItem value="Year 2">Year 2</SelectItem>
              <SelectItem value="Year 3">Year 3</SelectItem>
              <SelectItem value="Year 4">Year 4</SelectItem>
              <SelectItem value="Year 5">Year 5</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.period && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.period.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium">Actual Contribution</label>
          <Input
            type="number"
            step="0.01"
            {...form.register("actualContribution", { valueAsNumber: true })}
            placeholder="0.00"
          />
          {form.formState.errors.actualContribution && (
            <p className="text-sm text-red-600 mt-1">
              {form.formState.errors.actualContribution.message}
            </p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};
