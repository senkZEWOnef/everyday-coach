"use client";
import { BookOpen, Star, Plus } from "lucide-react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import Link from "next/link";

type BookNote = {
  id: string;
  title: string;
  author: string;
  rating: number;
  notes: string;
  dateRead: string;
  status: "reading" | "completed" | "to-read";
  pages: number;
  currentPage: number;
};

export function TodayBooks() {
  const [books] = useLocalStorage<BookNote[]>("books:notes", []);
  
  const currentlyReading = books.filter(book => book.status === "reading");
  const recentlyCompleted = books
    .filter(book => book.status === "completed")
    .sort((a, b) => new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime())
    .slice(0, 2);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Reading</h2>
        <Link href="/books" className="btn-ghost">
          <Plus className="w-4 h-4 mr-2" />
          Manage Books
        </Link>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-white/40" />
          <p className="text-white/60 mb-3">No books tracked yet</p>
          <Link href="/books" className="btn-primary">
            Start Reading Journal
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Currently Reading */}
          {currentlyReading.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-2">Currently Reading</h3>
              <div className="space-y-2">
                {currentlyReading.map((book) => (
                  <div key={book.id} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm">{book.title}</h4>
                        <p className="text-xs text-white/60">by {book.author}</p>
                      </div>
                    </div>
                    {book.pages > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>{book.currentPage}/{book.pages} pages</span>
                          <span>{Math.round((book.currentPage / book.pages) * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full transition-all"
                            style={{ width: `${(book.currentPage / book.pages) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recently Completed */}
          {recentlyCompleted.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-white/80 mb-2">Recently Completed</h3>
              <div className="space-y-2">
                {recentlyCompleted.map((book) => (
                  <div key={book.id} className="bg-white/5 rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{book.title}</h4>
                        <p className="text-xs text-white/60 mb-2">by {book.author}</p>
                        <div className="flex items-center">
                          {renderStars(book.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-white/5 rounded-xl p-3">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">{books.filter(b => b.status === "completed").length}</div>
                <div className="text-xs text-white/60">Completed</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{currentlyReading.length}</div>
                <div className="text-xs text-white/60">Reading</div>
              </div>
              <div>
                <div className="text-lg font-semibold">{books.filter(b => b.status === "to-read").length}</div>
                <div className="text-xs text-white/60">To Read</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}