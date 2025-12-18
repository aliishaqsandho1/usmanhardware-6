import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Package, Search, ArrowUpCircle, ArrowDownCircle, RefreshCw, 
  Calendar, Hash, FileText, ChevronLeft, ChevronRight, Filter,
  TrendingUp, TrendingDown, RotateCcw, ShoppingCart, Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { productsApi } from "@/services/api";
import { apiConfig } from "@/utils/apiConfig";
import { useNavigate } from "react-router-dom";

interface InventoryLog {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  type: string;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  reference: string;
  reason: string;
  condition: string;
  createdAt: string;
  sale: any;
  purchase: any;
}

const InventoryLogs = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  // Fetch all products for dropdown
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const response = await productsApi.getAll();
        if (response.data?.products) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch inventory logs when product is selected
  const fetchLogs = async (productId: string, page: number = 1) => {
    if (!productId) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${apiConfig.getBaseUrl()}/inventory-logs?product_id=${productId}&page=${page}&per_page=20`
      );
      const data = await response.json();
      
      if (data.success) {
        setLogs(data.data.logs || []);
        setPagination(data.data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 20
        });
      }
    } catch (error) {
      console.error("Error fetching inventory logs:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId) {
      fetchLogs(selectedProductId, 1);
    }
  }, [selectedProductId]);

  // Filter products for dropdown based on search
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(term) || 
      p.sku?.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Get log type styling
  const getLogTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sale':
        return {
          icon: ShoppingCart,
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          bgColor: 'border-l-red-500'
        };
      case 'purchase':
        return {
          icon: Truck,
          color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          bgColor: 'border-l-green-500'
        };
      case 'adjustment':
        return {
          icon: RefreshCw,
          color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          bgColor: 'border-l-blue-500'
        };
      case 'return':
        return {
          icon: RotateCcw,
          color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
          bgColor: 'border-l-purple-500'
        };
      default:
        return {
          icon: Package,
          color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
          bgColor: 'border-l-gray-500'
        };
    }
  };

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Inventory Logs</h1>
            <p className="text-sm text-muted-foreground">Track all stock movements and adjustments</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/sales')}>
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Sales
        </Button>
      </div>

      {/* Product Selector Card */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-primary" />
            Select Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>
            
            {/* Product Dropdown */}
            <Select value={selectedProductId} onValueChange={setSelectedProductId}>
              <SelectTrigger className="w-full md:w-[350px] h-11">
                <SelectValue placeholder={productsLoading ? "Loading products..." : "Select a product"} />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {filteredProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-xs text-muted-foreground">({product.sku})</span>
                    </div>
                  </SelectItem>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No products found
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Product Info */}
          {selectedProduct && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h3 className="font-semibold text-lg">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">SKU: {selectedProduct.sku} | Category: {selectedProduct.category}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedProduct.stock || 0}</div>
                    <div className="text-xs text-muted-foreground">Current Stock</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-muted-foreground">{selectedProduct.minStock || 0}</div>
                    <div className="text-xs text-muted-foreground">Min Stock</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logs Section */}
      {selectedProductId ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Activity History
                {!loading && (
                  <Badge variant="secondary" className="ml-2">
                    {pagination.totalItems} entries
                  </Badge>
                )}
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => fetchLogs(selectedProductId, pagination.currentPage)}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse"></div>
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="mt-4 text-sm font-medium text-muted-foreground">Loading logs...</div>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg">No Activity Yet</h3>
                <p className="text-sm text-muted-foreground mt-1">No inventory logs found for this product</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const typeStyles = getLogTypeStyles(log.type);
                  const TypeIcon = typeStyles.icon;
                  const quantityChange = log.balanceAfter - log.balanceBefore;
                  const isPositive = quantityChange >= 0;

                  return (
                    <div
                      key={log.id}
                      className={`p-4 rounded-lg border border-l-4 ${typeStyles.bgColor} bg-card hover:shadow-md transition-all`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${typeStyles.color}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={typeStyles.color}>
                                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(log.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="font-medium mt-1">{log.reason || log.reference}</p>
                            {log.reference && log.reason && (
                              <p className="text-sm text-muted-foreground">Ref: {log.reference}</p>
                            )}
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className={`flex items-center gap-1 justify-end text-lg font-bold ${
                            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {isPositive ? (
                              <TrendingUp className="h-5 w-5" />
                            ) : (
                              <TrendingDown className="h-5 w-5" />
                            )}
                            {isPositive ? '+' : ''}{quantityChange}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {log.balanceBefore} → {log.balanceAfter}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage <= 1}
                        onClick={() => fetchLogs(selectedProductId, pagination.currentPage - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage >= pagination.totalPages}
                        onClick={() => fetchLogs(selectedProductId, pagination.currentPage + 1)}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-16">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-semibold text-xl mb-2">Select a Product</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose a product from the dropdown above to view its complete inventory history including sales, purchases, and adjustments.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryLogs;
