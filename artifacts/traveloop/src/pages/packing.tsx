import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Trash2, Package, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useListPackingItems, useCreatePackingItem, useUpdatePackingItem, useDeletePackingItem, getListPackingItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Documents", "Clothing", "Electronics", "Toiletries", "Health", "Food", "General"];

const CATEGORY_COLORS: Record<string, string> = {
  Documents: "bg-blue-100 text-blue-700",
  Clothing: "bg-purple-100 text-purple-700",
  Electronics: "bg-slate-100 text-slate-700",
  Toiletries: "bg-pink-100 text-pink-700",
  Health: "bg-green-100 text-green-700",
  Food: "bg-orange-100 text-orange-700",
  General: "bg-gray-100 text-gray-700",
};

export function PackingPage() {
  const { tripId } = useParams<{ tripId: string }>();
  const id = Number(tripId);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useListPackingItems(id, { query: { enabled: !!id, queryKey: getListPackingItemsQueryKey(id) } });
  const createItem = useCreatePackingItem();
  const updateItem = useUpdatePackingItem();
  const deleteItem = useDeletePackingItem();

  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await createItem.mutateAsync({ tripId: id, data: { name: newName.trim(), category: newCategory } });
      queryClient.invalidateQueries({ queryKey: getListPackingItemsQueryKey(id) });
      setNewName("");
    } catch { toast({ title: "Failed to add item", variant: "destructive" }); }
  };

  const handleToggle = async (item: any) => {
    try {
      await updateItem.mutateAsync({ tripId: id, itemId: item.id, data: { isPacked: !item.isPacked } });
      queryClient.invalidateQueries({ queryKey: getListPackingItemsQueryKey(id) });
    } catch { toast({ title: "Failed to update item", variant: "destructive" }); }
  };

  const handleDelete = async (itemId: number) => {
    try {
      await deleteItem.mutateAsync({ tripId: id, itemId });
      queryClient.invalidateQueries({ queryKey: getListPackingItemsQueryKey(id) });
    } catch { toast({ title: "Failed to delete item", variant: "destructive" }); }
  };

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const catItems = items?.filter(i => i.category === cat) ?? [];
    if (catItems.length > 0) acc[cat] = catItems;
    return acc;
  }, {} as Record<string, typeof items>);

  const packedCount = items?.filter(i => i.isPacked).length ?? 0;
  const totalCount = items?.length ?? 0;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Button variant="ghost" className="mb-4 -ml-2 text-muted-foreground" onClick={() => setLocation(`/trips/${id}`)}>
          <ArrowLeft size={16} className="mr-2" />
          Back to trip
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground">Packing List</h1>
            {totalCount > 0 && (
              <p className="text-muted-foreground mt-1">
                {packedCount} of {totalCount} items packed
                {packedCount === totalCount && totalCount > 0 && " — all done!"}
              </p>
            )}
          </div>
          {totalCount > 0 && (
            <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
              <div className="w-2 h-2 rounded-full bg-primary" style={{ width: `${(packedCount / totalCount) * 40}px`, minWidth: 8 }} />
              <span className="text-sm font-medium text-foreground">{Math.round((packedCount / totalCount) * 100)}%</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Add item */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border">
          <CardContent className="pt-5 pb-5">
            <div className="flex gap-3">
              <Input
                placeholder="Add an item..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdd()}
                className="flex-1 h-11"
                data-testid="input-packing-item"
              />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="w-40 h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} disabled={createItem.isPending} className="h-11 px-5" data-testid="button-add-packing">
                <Plus size={16} className="mr-1.5" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4"><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-32 rounded-2xl" /></div>
      ) : totalCount === 0 ? (
        <Card className="border-dashed border-2 border-border bg-muted/20">
          <CardContent className="py-14 text-center">
            <Package size={32} className="text-primary/40 mx-auto mb-3" />
            <p className="text-muted-foreground">Start adding items to your packing list</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catItems]) => (
            <motion.div key={category} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground"}`}>
                      {category}
                    </span>
                    <span className="text-muted-foreground font-normal text-sm">{catItems?.filter(i => i.isPacked).length}/{catItems?.length}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <AnimatePresence>
                    {catItems?.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-muted/50 transition-colors group"
                      >
                        <button
                          onClick={() => handleToggle(item)}
                          className="flex-shrink-0 text-primary hover:scale-110 transition-transform"
                          data-testid={`toggle-packing-${item.id}`}
                        >
                          {item.isPacked
                            ? <CheckCircle2 size={22} className="text-primary" />
                            : <Circle size={22} className="text-border" />
                          }
                        </button>
                        <span className={`flex-1 text-sm ${item.isPacked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {item.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
