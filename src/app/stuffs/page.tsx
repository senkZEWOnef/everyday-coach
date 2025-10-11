"use client";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { 
  Plus, 
  Folder, 
  FolderOpen, 
  FileText, 
  Image as ImageIcon, 
  Trash2, 
  X, 
  Save,
  Search,
  Grid,
  List,
  Tag
} from "lucide-react";
import { format } from "date-fns";
import Image from "next/image";

type StuffItem = {
  id: string;
  title: string;
  content: string;
  type: "note" | "folder";
  folderId?: string;
  images: string[]; // base64 encoded images
  tags: string[];
  createdAt: string;
  updatedAt: string;
  color?: string;
};

type ViewMode = "grid" | "list";
type SortMode = "updated" | "created" | "title";

const COLORS = [
  "#3B82F6", // blue
  "#10B981", // green  
  "#F59E0B", // yellow
  "#EF4444", // red
  "#8B5CF6", // purple
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
];

export default function StuffsPage() {
  const [items, setItems] = useLocalStorage<StuffItem[]>("stuffs:items", []);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("updated");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<StuffItem | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const [newItem, setNewItem] = useState({
    title: "",
    content: "",
    type: "note" as const,
    tags: [] as string[],
    color: COLORS[0]
  });

  const [newTag, setNewTag] = useState("");

  // Ensure arrays are safe
  const safeItems = Array.isArray(items) ? items : [];

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get current folder items
  const currentItems = safeItems.filter(item => item.folderId === currentFolder);
  
  // Get folders (items with type "folder")
  const folders = safeItems.filter(item => item.type === "folder" && item.folderId === currentFolder);
  
  // Get notes and files
  const notes = currentItems.filter(item => item.type === "note");

  // Filter and sort items
  const filteredItems = [...folders, ...notes].filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedItems = filteredItems.sort((a, b) => {
    switch (sortMode) {
      case "title":
        return a.title.localeCompare(b.title);
      case "created":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "updated":
      default:
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  // Get breadcrumb path
  const getBreadcrumbPath = () => {
    const path = [];
    let currentId = currentFolder;
    
    while (currentId) {
      const folder = safeItems.find(item => item.id === currentId);
      if (folder) {
        path.unshift(folder);
        currentId = folder.folderId;
      } else {
        break;
      }
    }
    
    return path;
  };

  // Create new item
  const createItem = () => {
    if (!newItem.title.trim()) return;

    const item: StuffItem = {
      id: Date.now().toString(),
      title: newItem.title.trim(),
      content: newItem.content,
      type: newItem.type,
      folderId: currentFolder,
      images: [],
      tags: newItem.tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      color: newItem.color
    };

    setItems([...safeItems, item]);
    setNewItem({
      title: "",
      content: "",
      type: "note",
      tags: [],
      color: COLORS[0]
    });
    setShowCreateForm(false);
  };

  // Update item
  const updateItem = (updatedItem: StuffItem) => {
    setItems(safeItems.map(item => 
      item.id === updatedItem.id 
        ? { ...updatedItem, updatedAt: new Date().toISOString() }
        : item
    ));
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    // Also delete all items inside this folder if it's a folder
    const itemsToDelete = [itemId];
    const findChildItems = (folderId: string) => {
      const children = safeItems.filter(item => item.folderId === folderId);
      children.forEach(child => {
        itemsToDelete.push(child.id);
        if (child.type === "folder") {
          findChildItems(child.id);
        }
      });
    };
    
    const item = safeItems.find(i => i.id === itemId);
    if (item?.type === "folder") {
      findChildItems(itemId);
    }
    
    setItems(safeItems.filter(item => !itemsToDelete.includes(item.id)));
  };

  // Handle image upload
  const handleImageUpload = (file: File, itemId?: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      
      if (itemId) {
        // Add to existing item
        const item = safeItems.find(i => i.id === itemId);
        if (item) {
          updateItem({
            ...item,
            images: [...item.images, base64]
          });
        }
      } else if (selectedItem) {
        // Add to currently selected item
        setSelectedItem({
          ...selectedItem,
          images: [...selectedItem.images, base64]
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add tag
  const addTag = (itemId?: string) => {
    if (!newTag.trim()) return;
    
    if (itemId) {
      const item = safeItems.find(i => i.id === itemId);
      if (item && !item.tags.includes(newTag.trim())) {
        updateItem({
          ...item,
          tags: [...item.tags, newTag.trim()]
        });
      }
    } else if (selectedItem && !selectedItem.tags.includes(newTag.trim())) {
      setSelectedItem({
        ...selectedItem,
        tags: [...selectedItem.tags, newTag.trim()]
      });
    }
    
    setNewTag("");
  };

  // Remove tag
  const removeTag = (tag: string, itemId?: string) => {
    if (itemId) {
      const item = safeItems.find(i => i.id === itemId);
      if (item) {
        updateItem({
          ...item,
          tags: item.tags.filter(t => t !== tag)
        });
      }
    } else if (selectedItem) {
      setSelectedItem({
        ...selectedItem,
        tags: selectedItem.tags.filter(t => t !== tag)
      });
    }
  };

  // Remove image
  const removeImage = (imageIndex: number, itemId?: string) => {
    if (itemId) {
      const item = safeItems.find(i => i.id === itemId);
      if (item) {
        updateItem({
          ...item,
          images: item.images.filter((_, i) => i !== imageIndex)
        });
      }
    } else if (selectedItem) {
      setSelectedItem({
        ...selectedItem,
        images: selectedItem.images.filter((_, i) => i !== imageIndex)
      });
    }
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="text-center">Loading stuffs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Stuffs</h1>
            <p className="text-white/60 text-sm">Organize your notes, images, and ideas</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => setCurrentFolder(null)}
            className={`hover:text-blue-400 transition-colors ${!currentFolder ? "text-blue-400" : "text-white/60"}`}
          >
            Home
          </button>
          {getBreadcrumbPath().map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-2">
              <span className="text-white/40">/</span>
              <button
                onClick={() => setCurrentFolder(folder.id)}
                className="hover:text-blue-400 transition-colors text-white/60"
              >
                {folder.title}
              </button>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40" />
              <input
                className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm w-64"
                placeholder="Search stuffs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-sm"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="title">Title</option>
            </select>
            
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-500 text-white" : "text-white/60"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-blue-500 text-white" : "text-white/60"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Items Grid/List */}
      <section>
        {sortedItems.length === 0 ? (
          <div className="card p-12 text-center">
            <FileText className="w-12 h-12 text-white/40 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No items yet</h3>
            <p className="text-white/60 mb-4">
              {searchQuery ? "No items match your search." : "Start by creating your first note or folder."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create First Item
              </button>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-2"
          }>
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className={`card cursor-pointer transition-all hover:scale-105 ${
                  viewMode === "list" ? "p-4" : "p-4"
                }`}
                style={{ borderLeftColor: item.color, borderLeftWidth: '4px' }}
                onClick={() => {
                  if (item.type === "folder") {
                    setCurrentFolder(item.id);
                  } else {
                    setSelectedItem(item);
                    setShowEditor(true);
                  }
                }}
              >
                <div className={`flex items-start gap-3 ${viewMode === "list" ? "" : "flex-col"}`}>
                  <div className={`flex items-center gap-2 ${viewMode === "list" ? "flex-1" : "w-full"}`}>
                    {item.type === "folder" ? (
                      <FolderOpen className="w-5 h-5 text-blue-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-green-400" />
                    )}
                    <h3 className="font-medium truncate">{item.title}</h3>
                  </div>
                  
                  {viewMode === "grid" && (
                    <div className="w-full space-y-2">
                      {item.images.length > 0 && (
                        <div className="w-full h-32 bg-white/5 rounded-lg overflow-hidden">
                          <Image
                            src={item.images[0]}
                            alt={item.title}
                            width={300}
                            height={128}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      {item.content && (
                        <p className="text-white/60 text-sm line-clamp-3">
                          {item.content.substring(0, 100)}...
                        </p>
                      )}
                      
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-white/10 text-xs px-2 py-1 rounded">
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 3 && (
                            <span className="text-xs text-white/40">+{item.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className={`flex items-center justify-between text-xs text-white/40 ${
                    viewMode === "list" ? "ml-auto" : "w-full mt-2"
                  }`}>
                    <span>{format(new Date(item.updatedAt), "MMM dd")}</span>
                    <div className="flex items-center gap-2">
                      {item.images.length > 0 && <ImageIcon className="w-3 h-3" />}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.id);
                        }}
                        className="hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Create Item Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Item</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="btn-ghost"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-4">
              <input
                className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                placeholder="Title"
                value={newItem.title}
                onChange={(e) => setNewItem({...newItem, title: e.target.value})}
              />
              
              <div className="flex gap-2">
                <button
                  onClick={() => setNewItem({...newItem, type: "note"})}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    newItem.type === "note" 
                      ? "border-blue-400 bg-blue-500/20 text-blue-300" 
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Note
                </button>
                <button
                  onClick={() => setNewItem({...newItem, type: "folder"})}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    newItem.type === "folder" 
                      ? "border-blue-400 bg-blue-500/20 text-blue-300" 
                      : "border-white/20 hover:border-white/40"
                  }`}
                >
                  <Folder className="w-4 h-4" />
                  Folder
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewItem({...newItem, color})}
                      className={`w-8 h-8 rounded-full transition-transform ${
                        newItem.color === color ? "scale-110 ring-2 ring-white/50" : ""
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              {newItem.type === "note" && (
                <textarea
                  className="w-full bg-transparent border border-white/20 rounded-lg px-3 py-2"
                  placeholder="Content (optional)"
                  rows={4}
                  value={newItem.content}
                  onChange={(e) => setNewItem({...newItem, content: e.target.value})}
                />
              )}
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-ghost"
                >
                  Cancel
                </button>
                <button
                  onClick={createItem}
                  disabled={!newItem.title.trim()}
                  className="btn-primary"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Page Editor */}
      {showEditor && selectedItem && (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
          {/* Editor Header */}
          <div className="border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (selectedItem) {
                    updateItem(selectedItem);
                  }
                  setShowEditor(false);
                  setSelectedItem(null);
                }}
                className="btn-ghost"
              >
                <X className="w-4 h-4 mr-1" />
                Close
              </button>
              
              <input
                className="bg-transparent text-xl font-semibold border-none outline-none"
                value={selectedItem.title}
                onChange={(e) => setSelectedItem({...selectedItem, title: e.target.value})}
                placeholder="Title..."
              />
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  Array.from(e.target.files || []).forEach(file => 
                    handleImageUpload(file)
                  );
                }}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="btn-ghost">
                <ImageIcon className="w-4 h-4 mr-1" />
                Add Images
              </label>
              
              <button
                onClick={() => {
                  updateItem(selectedItem);
                  setShowEditor(false);
                  setSelectedItem(null);
                }}
                className="btn-primary"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>
            </div>
          </div>
          
          {/* Editor Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 p-4 space-y-4 overflow-y-auto">
              {/* Tags */}
              <div>
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-sm"
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addTag()}
                    />
                    <button onClick={() => addTag()} className="btn-ghost text-sm">
                      <Tag className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.tags.map(tag => (
                      <span
                        key={tag}
                        className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded flex items-center gap-1"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Images */}
              <div>
                <h3 className="font-medium mb-2">Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {selectedItem.images.map((image, imageIndex) => (
                    <div key={imageIndex} className="relative group">
                      <Image
                        src={image}
                        alt={`Image ${imageIndex + 1}`}
                        width={140}
                        height={100}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        onClick={() => removeImage(imageIndex)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Metadata */}
              <div className="text-xs text-white/60 space-y-1">
                <div>Created: {format(new Date(selectedItem.createdAt), "MMM dd, yyyy 'at' HH:mm")}</div>
                <div>Updated: {format(new Date(selectedItem.updatedAt), "MMM dd, yyyy 'at' HH:mm")}</div>
              </div>
            </div>
            
            {/* Main Editor */}
            <div className="flex-1 p-6">
              <textarea
                className="w-full h-full bg-transparent border-none outline-none resize-none text-lg leading-relaxed"
                placeholder="Start writing..."
                value={selectedItem.content}
                onChange={(e) => setSelectedItem({...selectedItem, content: e.target.value})}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}