import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Calendar, Package, TrendingUp, ShoppingBag } from "lucide-react";
import { apiConfig } from '@/utils/apiConfig';

interface CategorySalesData {
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  productCount: number;
}

interface MonthlyReportData {
  month: string;
  year: number;
  daysElapsed: number;
  totalDays: number;
  categories: CategorySalesData[];
  totalQuantitySold: number;
  totalRevenue: number;
  totalProducts: number;
}

const CHART_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#84cc16", // Lime
  "#f97316", // Orange
  "#6366f1", // Indigo
];

function formatNumber(value: number): string {
  const num = Number(value);
  if (isNaN(num)) return '0';

  if (num >= 10000000) {
    return (num / 10000000).toFixed(2) + ' Cr';
  } else if (num >= 100000) {
    return (num / 100000).toFixed(2) + ' Lac';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num.toFixed(0);
  }
}

const chartConfig = {
  quantity: {
    label: "Qty Sold",
    color: "#3b82f6",
  },
  revenue: {
    label: "Revenue",
    color: "#10b981",
  },
};

export default function MonthlyReportCard() {
  const { data: reportData, isLoading, error } = useQuery({
    queryKey: ['monthly-category-sales'],
    queryFn: async () => {
      const response = await fetch(`${apiConfig.getBaseUrl()}/reports/monthly-category-sales`);
      if (!response.ok) throw new Error('Failed to fetch monthly report');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const report: MonthlyReportData = reportData?.data || {
    month: new Date().toLocaleString('en-US', { month: 'long' }),
    year: new Date().getFullYear(),
    daysElapsed: new Date().getDate(),
    totalDays: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate(),
    categories: [],
    totalQuantitySold: 0,
    totalRevenue: 0,
    totalProducts: 0,
  };

  // Format data for bar chart (top 8 categories by quantity)
  const barChartData = [...(report.categories || [])]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 8)
    .map((cat, index) => ({
      name: cat.category.length > 12 ? cat.category.substring(0, 12) + '...' : cat.category,
      fullName: cat.category,
      quantity: cat.totalQuantity,
      revenue: cat.totalRevenue,
      products: cat.productCount,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

  // Format data for pie chart
  const pieChartData = [...(report.categories || [])]
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 6)
    .map((cat, index) => ({
      name: cat.category.length > 15 ? cat.category.substring(0, 15) + '...' : cat.category,
      value: cat.totalQuantity,
      revenue: cat.totalRevenue,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  if (isLoading) {
    return (
      <Card className="col-span-1 lg:col-span-2 shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-purple-100 dark:from-violet-950/20 dark:to-purple-900/20">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent className="p-4">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-1 lg:col-span-2 shadow-xl border-0 rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-purple-100 dark:from-violet-950/20 dark:to-purple-900/20">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Calendar className="h-5 w-5 text-violet-600" />
            This Month Report
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center text-muted-foreground">
          Failed to load monthly report. Please try again.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2 shadow-xl border-0 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-violet-50 to-purple-100 dark:from-violet-950/20 dark:to-purple-900/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Calendar className="h-5 w-5 text-violet-600" />
              This Month Report
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {report.month} 1 - {report.daysElapsed}, {report.year} ({report.daysElapsed} days)
            </CardDescription>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
              <ShoppingBag className="h-3 w-3 mr-1" />
              {formatNumber(report.totalQuantitySold)} Units
            </Badge>
            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
              <TrendingUp className="h-3 w-3 mr-1" />
              Rs. {formatNumber(report.totalRevenue)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {report.categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No sales data available for this month yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Bar Chart - Quantity by Category */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quantity Sold by Category
              </h4>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <BarChart 
                  data={barChartData} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 11, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <YAxis 
                    type="category"
                    dataKey="name" 
                    tick={{ fontSize: 11, fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => {
                          const item = props.payload;
                          return [
                            <div key="tooltip" className="space-y-1">
                              <p className="font-medium">{item.fullName}</p>
                              <p>Qty: {Number(item.quantity).toLocaleString()} units</p>
                              <p>Revenue: Rs. {formatNumber(item.revenue)}</p>
                              <p>Products: {item.products}</p>
                            </div>,
                            ''
                          ];
                        }}
                      />
                    }
                  />
                  <Bar 
                    dataKey="quantity" 
                    radius={[0, 4, 4, 0]} 
                    name="Quantity Sold"
                  >
                    {barChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </div>

            {/* Pie Chart - Category Distribution */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Category Distribution
              </h4>
              <ChartContainer config={chartConfig} className="h-[280px] w-full">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value, name, props) => {
                          const item = props.payload;
                          return [
                            <div key="tooltip" className="space-y-1">
                              <p className="font-medium">{item.name}</p>
                              <p>Qty: {Number(item.value).toLocaleString()} units</p>
                              <p>Revenue: Rs. {formatNumber(item.revenue)}</p>
                            </div>,
                            ''
                          ];
                        }}
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
            </div>

            {/* Category Details Table */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Category Breakdown (Top 10)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-2 font-medium">Category</th>
                      <th className="text-right p-2 font-medium">Products</th>
                      <th className="text-right p-2 font-medium">Qty Sold</th>
                      <th className="text-right p-2 font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(report.categories || [])]
                      .sort((a, b) => b.totalQuantity - a.totalQuantity)
                      .slice(0, 10)
                      .map((cat, index) => (
                        <tr key={cat.category} className="border-b hover:bg-muted/30 transition-colors">
                          <td className="p-2 flex items-center gap-2">
                            <span 
                              className="w-3 h-3 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                            />
                            <span className="truncate max-w-[150px]">{cat.category}</span>
                          </td>
                          <td className="text-right p-2 text-muted-foreground">{cat.productCount}</td>
                          <td className="text-right p-2 font-medium">{cat.totalQuantity.toLocaleString()}</td>
                          <td className="text-right p-2 text-green-600 dark:text-green-400">
                            Rs. {formatNumber(cat.totalRevenue)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-muted/50 font-medium">
                      <td className="p-2">Total</td>
                      <td className="text-right p-2">{report.totalProducts}</td>
                      <td className="text-right p-2">{report.totalQuantitySold.toLocaleString()}</td>
                      <td className="text-right p-2 text-green-600 dark:text-green-400">
                        Rs. {formatNumber(report.totalRevenue)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
