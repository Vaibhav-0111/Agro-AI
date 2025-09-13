import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { FileText, Download, Calendar, TrendingUp, AlertCircle, CheckCircle, Filter, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Reports = () => {
  const [reportType, setReportType] = useState("yield");
  const [timeRange, setTimeRange] = useState("month");
  const [selectedField, setSelectedField] = useState("all");
  
  const reportTypes = [
    { value: "yield", label: "Yield Analysis", icon: TrendingUp, color: "text-green-500" },
    { value: "health", label: "Crop Health", icon: CheckCircle, color: "text-blue-500" },
    { value: "alerts", label: "Alert Summary", icon: AlertCircle, color: "text-orange-500" },
    { value: "performance", label: "Performance Metrics", icon: BarChart, color: "text-purple-500" },
  ];

  const yieldData = [
    { month: "Jan", wheat: 4.2, corn: 5.1, soybeans: 3.8 },
    { month: "Feb", wheat: 4.5, corn: 5.3, soybeans: 4.0 },
    { month: "Mar", wheat: 4.8, corn: 5.6, soybeans: 4.3 },
    { month: "Apr", wheat: 5.1, corn: 5.8, soybeans: 4.5 },
    { month: "May", wheat: 5.4, corn: 6.1, soybeans: 4.7 },
    { month: "Jun", wheat: 5.7, corn: 6.4, soybeans: 5.0 },
  ];

  const healthData = [
    { name: "Excellent", value: 65, color: "#10b981" },
    { name: "Good", value: 25, color: "#3b82f6" },
    { name: "Warning", value: 8, color: "#f59e0b" },
    { name: "Critical", value: 2, color: "#ef4444" },
  ];

  const recentReports = [
    {
      id: 1,
      name: "Monthly Yield Analysis - June 2024",
      type: "Yield Report",
      created: "2024-06-30",
      status: "completed",
      size: "2.3 MB"
    },
    {
      id: 2,
      name: "Crop Health Assessment - Q2 2024",
      type: "Health Report", 
      created: "2024-06-28",
      status: "completed",
      size: "1.8 MB"
    },
    {
      id: 3,
      name: "Alert Summary - Week 26",
      type: "Alert Report",
      created: "2024-06-26",
      status: "processing",
      size: "0.9 MB"
    },
  ];

  const generateReport = () => {
    // Simulate report generation
    console.log(`Generating ${reportType} report for ${timeRange} period`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-[hsl(var(--agro-success))]";
      case "processing": return "bg-[hsl(var(--agro-warning))]";
      case "failed": return "bg-[hsl(var(--agro-danger))]";
      default: return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate comprehensive reports and analyze your agricultural data with detailed insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Configuration */}
          <motion.div 
            className="lg:col-span-1 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                  Generate Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className={`h-4 w-4 ${type.color}`} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Time Range</label>
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Last Week</SelectItem>
                      <SelectItem value="month">Last Month</SelectItem>
                      <SelectItem value="quarter">Last Quarter</SelectItem>
                      <SelectItem value="year">Last Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {timeRange === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <DatePickerWithRange />
                  </motion.div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Field Selection</label>
                  <Select value={selectedField} onValueChange={setSelectedField}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="north">North Field</SelectItem>
                      <SelectItem value="south">South Field</SelectItem>
                      <SelectItem value="east">East Field</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={generateReport} 
                    className="w-full bg-[hsl(var(--agro-primary))] hover:bg-[hsl(var(--agro-primary))]/90"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Report
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {recentReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm group-hover:text-[hsl(var(--agro-primary))] transition-colors">
                            {report.name}
                          </h4>
                          <Badge className={`${getStatusColor(report.status)} text-white text-xs`}>
                            {report.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {report.created}
                          </div>
                          <span>{report.size}</span>
                        </div>
                        {report.status === "processing" && (
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Progress value={65} className="h-1" />
                          </motion.div>
                        )}
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {report.status === "completed" && (
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Analytics Dashboard */}
          <motion.div 
            className="lg:col-span-2 space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[hsl(var(--agro-success))]" />
                    Yield Trends
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Last 6 Months</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={yieldData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="wheat" 
                      stroke="hsl(var(--agro-warning))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--agro-warning))", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="corn" 
                      stroke="hsl(var(--agro-success))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--agro-success))", strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="soybeans" 
                      stroke="hsl(var(--agro-sky))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--agro-sky))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-[hsl(var(--agro-success))]" />
                    Crop Health Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={healthData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {healthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="h-5 w-5 text-[hsl(var(--agro-primary))]" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Irrigation Efficiency</span>
                      <span className="text-sm font-medium">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Sensor Coverage</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Alert Response Time</span>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Crop Yield Prediction</span>
                      <span className="text-sm font-medium">91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;