"use client";
import { BookOpenCheck, Star, Plus, Search, Filter, Save, X, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { useState, useEffect } from "react";
import { format } from "date-fns";

type ReadingSession = {
  id: string;
  date: string;
  notes: string;
  pagesRead: number;
};

type BookNote = {
  id: string;
  title: string;
  author: string;
  rating: number;
  notes: string;
  dateRead: string;
  startDate?: string;
  status: "reading" | "completed" | "to-read";
  pages: number;
  currentPage: number;
  readingSessions: ReadingSession[];
  coverImage?: string;
  gallery: string[];
};

export default function BooksPage() {
  const [books, setBooks] = useLocalStorage<BookNote[]>("books:notes", []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingSession, setEditingSession] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    
    // Migrate existing books to add gallery field if missing
    const migrationNeeded = books.some(book => !book.gallery);
    if (migrationNeeded) {
      const migratedBooks = books.map(book => ({
        ...book,
        gallery: book.gallery || []
      }));
      setBooks(migratedBooks);
    }
  }, [books, setBooks]);

  // Generate stable IDs
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  };

  // Image handling functions
  const handleImageUpload = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
  };

  const addToGallery = async (bookId: string, file: File) => {
    const imageUrl = await handleImageUpload(file);
    const book = books.find(b => b.id === bookId);
    if (book) {
      updateBook(bookId, {
        gallery: [...(book.gallery || []), imageUrl]
      });
    }
  };

  const setCoverImage = async (bookId: string, file: File) => {
    const imageUrl = await handleImageUpload(file);
    updateBook(bookId, { coverImage: imageUrl });
  };

  const removeFromGallery = (bookId: string, imageUrl: string) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
      updateBook(bookId, {
        gallery: book.gallery.filter(img => img !== imageUrl)
      });
    }
  };
  
  const [newBook, setNewBook] = useState<Partial<BookNote>>({
    title: "",
    author: "",
    rating: 0,
    notes: "",
    status: "to-read",
    pages: 0,
    currentPage: 0,
    readingSessions: [],
    gallery: [],
  });

  // Filter books based on search and status
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const addBook = () => {
    if (!newBook.title || !newBook.author) return;
    
    const book: BookNote = {
      id: generateId(),
      title: newBook.title,
      author: newBook.author,
      rating: newBook.rating || 0,
      notes: newBook.notes || "",
      dateRead: new Date().toISOString(),
      startDate: newBook.status === "reading" ? new Date().toISOString().split('T')[0] : undefined,
      status: newBook.status || "to-read",
      pages: newBook.pages || 0,
      currentPage: newBook.currentPage || 0,
      readingSessions: [],
      gallery: [],
    };
    
    setBooks([book, ...books]);
    setNewBook({
      title: "",
      author: "",
      rating: 0,
      notes: "",
      status: "to-read",
      pages: 0,
      currentPage: 0,
      readingSessions: [],
      gallery: [],
    });
    setShowAddForm(false);
  };

  const updateBook = (id: string, updates: Partial<BookNote>) => {
    setBooks(books.map(book => 
      book.id === id ? { ...book, ...updates } : book
    ));
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter(book => book.id !== id));
  };

  const addReadingSession = (bookId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newSession: ReadingSession = {
      id: generateId(),
      date: today,
      notes: "",
      pagesRead: 0,
    };
    
    updateBook(bookId, {
      readingSessions: [...(books.find(b => b.id === bookId)?.readingSessions || []), newSession]
    });
    setEditingSession(newSession.id);
  };

  const updateReadingSession = (bookId: string, sessionId: string, updates: Partial<ReadingSession>) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const updatedSessions = book.readingSessions.map(session =>
      session.id === sessionId ? { ...session, ...updates } : session
    );
    
    updateBook(bookId, { readingSessions: updatedSessions });
  };

  const deleteReadingSession = (bookId: string, sessionId: string) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    const updatedSessions = book.readingSessions.filter(session => session.id !== sessionId);
    updateBook(bookId, { readingSessions: updatedSessions });
  };


  const getStatusBadge = (status: string) => {
    const colors = {
      "reading": "bg-blue-500/20 text-blue-300",
      "completed": "bg-green-500/20 text-green-300",
      "to-read": "bg-gray-500/20 text-gray-300"
    };
    return colors[status as keyof typeof colors] || colors["to-read"];
  };

  // Prevent hydration mismatch by only rendering after client-side hydration
  if (!isClient) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Reading Journal</h1>
            <p className="text-white/60">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Reading Journal</h1>
          <p className="text-white/60">{books.length} books tracked • {filteredBooks.length} showing</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Book
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 placeholder-white/40"
            placeholder="Search books by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/60" />
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Books</option>
            <option value="to-read">To Read</option>
            <option value="reading">Currently Reading</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Add Book Form */}
      {showAddForm && (
        <div className="card p-6">
          <h3 className="text-lg font-medium mb-4">Add New Book</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="bg-transparent border border-white/10 rounded-lg px-3 py-2"
              placeholder="Book title"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
            />
            <input
              className="bg-transparent border border-white/10 rounded-lg px-3 py-2"
              placeholder="Author"
              value={newBook.author}
              onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
            />
            <input
              className="bg-transparent border border-white/10 rounded-lg px-3 py-2"
              type="number"
              placeholder="Total pages"
              value={newBook.pages}
              onChange={(e) => setNewBook({ ...newBook, pages: Number(e.target.value) })}
            />
            <select
              className="bg-transparent border border-white/10 rounded-lg px-3 py-2"
              value={newBook.status}
              onChange={(e) => setNewBook({ ...newBook, status: e.target.value as BookNote["status"] })}
            >
              <option value="to-read">To Read</option>
              <option value="reading">Currently Reading</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <textarea
            className="w-full mt-4 bg-transparent border border-white/10 rounded-lg px-3 py-2"
            placeholder="Initial notes or thoughts..."
            rows={3}
            value={newBook.notes}
            onChange={(e) => setNewBook({ ...newBook, notes: e.target.value })}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              className="btn-ghost"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={addBook}
            >
              Add Book
            </button>
          </div>
        </div>
      )}

      {/* Books Grid - Small Preview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full">
            <div className="card p-8 text-center">
              <BookOpenCheck className="w-12 h-12 mx-auto mb-4 text-white/40" />
              <h3 className="text-lg font-medium mb-2">
                {books.length === 0 ? "No books yet" : "No books match your filters"}
              </h3>
              <p className="text-white/60">
                {books.length === 0 ? "Start tracking your reading journey" : "Try adjusting your search or filters"}
              </p>
            </div>
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div 
              key={book.id} 
              className="card p-3 cursor-pointer hover:bg-white/10 transition-colors"
              onClick={() => setSelectedBook(book.id)}
            >
              {/* Compact Book Preview */}
              <div className="space-y-2">
                <div className="aspect-[3/4] bg-white/5 rounded-lg flex items-center justify-center mb-2 relative overflow-hidden">
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={`${book.title} cover`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpenCheck className="w-6 h-6 text-white/40" />
                  )}
                  {book.gallery && book.gallery.length > 0 && (
                    <div className="absolute top-1 right-1 bg-black/60 rounded-full p-1">
                      <ImageIcon className="w-3 h-3 text-white/80" />
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-sm truncate" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-xs text-white/60 truncate" title={book.author}>
                    {book.author}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`badge text-xs px-2 py-0.5 ${getStatusBadge(book.status)}`}>
                    {book.status === "to-read" ? "To Read" : 
                     book.status === "reading" ? "Reading" : "Done"}
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < book.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {book.status === "reading" && book.pages > 0 && (
                  <div className="w-full bg-white/10 rounded-full h-1">
                    <div
                      className="bg-blue-500 h-1 rounded-full transition-all"
                      style={{ width: `${Math.min(100, (book.currentPage / book.pages) * 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Full-Page Book Editor Modal */}
      {selectedBook && (() => {
        const book = books.find(b => b.id === selectedBook);
        if (!book) return null;
        
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur z-50 flex items-center justify-center p-4">
            <div className="bg-brand-card rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold">Edit Book</h2>
                <div className="flex gap-2">
                  <button
                    className="btn-ghost text-red-400 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this book?')) {
                        deleteBook(book.id);
                        setSelectedBook(null);
                      }
                    }}
                  >
                    Delete Book
                  </button>
                  <button
                    className="btn-ghost"
                    onClick={() => setSelectedBook(null)}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column - Cover & Gallery */}
                  <div className="space-y-6">
                    {/* Cover Image */}
                    <div>
                      <label className="block text-sm font-medium mb-3">Book Cover</label>
                      <div className="space-y-3">
                        <div className="aspect-[3/4] bg-white/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                          {book.coverImage ? (
                            <img 
                              src={book.coverImage} 
                              alt={`${book.title} cover`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center">
                              <BookOpenCheck className="w-8 h-8 text-white/40 mx-auto mb-2" />
                              <p className="text-xs text-white/60">No cover image</p>
                            </div>
                          )}
                          {book.coverImage && (
                            <button
                              className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateBook(book.id, { coverImage: undefined });
                              }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <label className="btn-ghost cursor-pointer w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Cover
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) setCoverImage(book.id, file);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Gallery Preview */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium">Gallery</label>
                        <span className="text-xs text-white/60">{book.gallery?.length || 0} images</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                        {book.gallery?.slice(0, 4).map((image, index) => (
                          <div key={index} className="aspect-square bg-white/5 rounded overflow-hidden relative">
                            <img 
                              src={image} 
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {book.gallery && book.gallery.length > 4 && (
                          <div className="aspect-square bg-white/5 rounded flex items-center justify-center">
                            <span className="text-xs text-white/60">+{book.gallery.length - 4}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle Column - Book Details */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <input
                          className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3"
                          value={book.title}
                          onChange={(e) => updateBook(book.id, { title: e.target.value })}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Author</label>
                        <input
                          className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3"
                          value={book.author}
                          onChange={(e) => updateBook(book.id, { author: e.target.value })}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Total Pages</label>
                          <input
                            type="number"
                            className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3"
                            value={book.pages}
                            onChange={(e) => updateBook(book.id, { pages: Number(e.target.value) })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-2">Status</label>
                          <select
                            className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3"
                            value={book.status}
                            onChange={(e) => updateBook(book.id, { 
                              status: e.target.value as BookNote["status"],
                              currentPage: e.target.value === "completed" ? book.pages : book.currentPage,
                              startDate: e.target.value === "reading" && !book.startDate ? new Date().toISOString().split('T')[0] : book.startDate
                            })}
                          >
                            <option value="to-read">To Read</option>
                            <option value="reading">Currently Reading</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>
                      </div>

                      {book.status === "reading" && (
                        <div>
                          <label className="block text-sm font-medium mb-2">Current Page</label>
                          <div className="space-y-3">
                            <input
                              type="number"
                              max={book.pages}
                              className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3"
                              value={book.currentPage}
                              onChange={(e) => updateBook(book.id, { currentPage: Number(e.target.value) })}
                            />
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${Math.min(100, (book.currentPage / book.pages) * 100)}%` }}
                              />
                            </div>
                            <p className="text-sm text-white/60">
                              {Math.round((book.currentPage / book.pages) * 100)}% complete
                            </p>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium mb-2">Rating</label>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-6 cursor-pointer ${
                                i < book.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                              }`}
                              onClick={() => updateBook(book.id, { rating: i + 1 })}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Notes, Gallery & Reading Sessions */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Notes & Thoughts</label>
                      <textarea
                        className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 min-h-[200px] resize-vertical"
                        value={book.notes}
                        onChange={(e) => updateBook(book.id, { notes: e.target.value })}
                        placeholder="Write your thoughts, quotes, insights, or anything else about this book..."
                      />
                    </div>

                    {/* Gallery Management */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium">Photo Gallery</label>
                        <label className="btn-ghost text-sm cursor-pointer">
                          <Camera className="w-4 h-4 mr-1" />
                          Add Photo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) addToGallery(book.id, file);
                            }}
                          />
                        </label>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto">
                        {book.gallery?.length === 0 ? (
                          <div className="col-span-2 text-center py-8">
                            <ImageIcon className="w-8 h-8 text-white/40 mx-auto mb-2" />
                            <p className="text-white/60 text-sm">No photos yet</p>
                            <p className="text-white/40 text-xs">Add notes, highlights, or memorable pages</p>
                          </div>
                        ) : (
                          book.gallery?.map((image, index) => (
                            <div key={index} className="aspect-square bg-white/5 rounded-lg overflow-hidden relative group">
                              <img 
                                src={image} 
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-full object-cover cursor-pointer"
                                onClick={() => {
                                  // Open full-size image in new tab
                                  window.open(image, '_blank');
                                }}
                              />
                              <button
                                className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Delete this image?')) {
                                    removeFromGallery(book.id, image);
                                  }
                                }}
                              >
                                <X className="w-3 h-3" />
                              </button>
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                Photo {index + 1}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <p className="text-xs text-white/40 mt-2">
                        Perfect for: Book notes, highlighted passages, bookmarks, memorable quotes, or any page you want to remember!
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium">Reading Sessions</label>
                        <button
                          className="btn-ghost text-sm"
                          onClick={() => addReadingSession(book.id)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Session
                        </button>
                      </div>
                      
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {book.readingSessions?.length === 0 ? (
                          <p className="text-white/60 text-sm text-center py-8">
                            No reading sessions yet. Add one to track your progress!
                          </p>
                        ) : (
                          book.readingSessions?.map((session) => (
                            <div key={session.id} className="bg-white/5 rounded-lg p-4">
                              {editingSession === session.id ? (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-sm font-medium text-white/80 mb-2">Date</label>
                                      <input
                                        type="date"
                                        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                                        value={session.date}
                                        onChange={(e) => updateReadingSession(book.id, session.id, { date: e.target.value })}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-white/80 mb-2">Pages Read</label>
                                      <input
                                        type="number"
                                        className="w-full bg-transparent border border-white/10 rounded-lg px-3 py-2"
                                        value={session.pagesRead}
                                        onChange={(e) => updateReadingSession(book.id, session.id, { pagesRead: Number(e.target.value) })}
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-white/80 mb-2">Session Notes</label>
                                    <textarea
                                      className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3 resize-vertical min-h-[150px]"
                                      value={session.notes}
                                      onChange={(e) => updateReadingSession(book.id, session.id, { notes: e.target.value })}
                                      placeholder="How was this reading session? What did you think about? Any quotes, insights, or reactions to what you read?"
                                    />
                                    <p className="text-xs text-white/40 mt-1">Tip: This area is resizable - drag the bottom-right corner</p>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      className="btn-ghost"
                                      onClick={() => setEditingSession(null)}
                                    >
                                      <Save className="w-4 h-4 mr-2" />
                                      Save
                                    </button>
                                    <button
                                      className="btn-ghost text-red-400 hover:bg-red-500/10"
                                      onClick={() => deleteReadingSession(book.id, session.id)}
                                    >
                                      Delete Session
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div 
                                  className="cursor-pointer hover:bg-white/5 -m-4 p-4 rounded-lg transition-colors"
                                  onClick={() => setSelectedSession(session.id)}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="font-medium">
                                      {isClient ? format(new Date(session.date), "MMM dd, yyyy") : session.date}
                                    </span>
                                    {session.pagesRead > 0 && (
                                      <span className="text-white/60">{session.pagesRead} pages</span>
                                    )}
                                  </div>
                                  {session.notes ? (
                                    <div className="space-y-2">
                                      <p className="text-white/80 whitespace-pre-wrap line-clamp-3">{session.notes}</p>
                                      <p className="text-xs text-white/40">Click to view full session</p>
                                    </div>
                                  ) : (
                                    <p className="text-white/60 italic">No notes yet - click to add some</p>
                                  )}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Full-Page Reading Session Editor */}
      {selectedSession && (() => {
        const session = books.flatMap(b => b.readingSessions || []).find(s => s.id === selectedSession);
        const book = books.find(b => b.readingSessions?.some(s => s.id === selectedSession));
        if (!session || !book) return null;
        
        return (
          <div className="fixed inset-0 bg-black/90 backdrop-blur z-[60] flex items-center justify-center p-4">
            <div className="bg-brand-card rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
              {/* Session Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-semibold">Reading Session</h2>
                  <p className="text-white/60 mt-1">{book.title} by {book.author}</p>
                </div>
                <button
                  className="btn-ghost"
                  onClick={() => setSelectedSession(null)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Session Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Session Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date</label>
                      <input
                        type="date"
                        className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3"
                        value={session.date}
                        onChange={(e) => updateReadingSession(book.id, session.id, { date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pages Read</label>
                      <input
                        type="number"
                        className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-3"
                        value={session.pagesRead}
                        onChange={(e) => updateReadingSession(book.id, session.id, { pagesRead: Number(e.target.value) })}
                        placeholder="How many pages?"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        className="btn-ghost text-red-400 hover:bg-red-500/10 w-full"
                        onClick={() => {
                          if (confirm('Delete this reading session?')) {
                            deleteReadingSession(book.id, session.id);
                            setSelectedSession(null);
                          }
                        }}
                      >
                        Delete Session
                      </button>
                    </div>
                  </div>

                  {/* Full Notes Editor */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Session Notes</label>
                    <div className="relative">
                      <textarea
                        className="w-full bg-transparent border border-white/10 rounded-lg px-4 py-4 min-h-[60vh] resize-vertical"
                        value={session.notes}
                        onChange={(e) => updateReadingSession(book.id, session.id, { notes: e.target.value })}
                        placeholder="What happened in this reading session?

• What did you read about?
• Any interesting quotes or passages?
• How did the story/content make you feel?
• What questions or thoughts came up?
• Any connections to other books or experiences?
• Character development or plot points?
• Key insights or learnings?

Write as much as you want - this space is yours!"
                        style={{ fontSize: '16px', lineHeight: '1.6' }}
                      />
                      <div className="absolute bottom-4 right-4 text-xs text-white/40 bg-black/50 px-2 py-1 rounded">
                        {session.notes.length} characters
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-white/40">
                        Tip: This editor auto-saves as you type. Use Ctrl/Cmd + Enter for new lines.
                      </p>
                      <p className="text-xs text-white/40">
                        Word count: {session.notes.split(/\s+/).filter(word => word.length > 0).length}
                      </p>
                    </div>
                  </div>

                  {/* Reading Context */}
                  <div className="bg-white/5 rounded-lg p-4">
                    <h3 className="font-medium mb-3">Reading Context</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-white/60">Book Progress:</span>
                        <p className="font-medium">{book.currentPage}/{book.pages} pages</p>
                      </div>
                      <div>
                        <span className="text-white/60">Overall Rating:</span>
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < book.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/60">Status:</span>
                        <p className="font-medium capitalize">{book.status.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="text-white/60">Total Sessions:</span>
                        <p className="font-medium">{book.readingSessions?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Session Navigation */}
                  {book.readingSessions && book.readingSessions.length > 1 && (
                    <div className="flex items-center justify-between">
                      <button
                        className="btn-ghost"
                        onClick={() => {
                          const currentIndex = book.readingSessions!.findIndex(s => s.id === selectedSession);
                          const prevSession = book.readingSessions![currentIndex - 1];
                          if (prevSession) setSelectedSession(prevSession.id);
                        }}
                        disabled={book.readingSessions.findIndex(s => s.id === selectedSession) === 0}
                      >
                        ← Previous Session
                      </button>
                      <span className="text-sm text-white/60">
                        Session {book.readingSessions.findIndex(s => s.id === selectedSession) + 1} of {book.readingSessions.length}
                      </span>
                      <button
                        className="btn-ghost"
                        onClick={() => {
                          const currentIndex = book.readingSessions!.findIndex(s => s.id === selectedSession);
                          const nextSession = book.readingSessions![currentIndex + 1];
                          if (nextSession) setSelectedSession(nextSession.id);
                        }}
                        disabled={book.readingSessions.findIndex(s => s.id === selectedSession) === book.readingSessions.length - 1}
                      >
                        Next Session →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}