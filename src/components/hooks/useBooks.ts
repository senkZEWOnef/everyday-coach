import { useState, useEffect } from "react";

type BookNote = {
  id: string;
  title: string;
  author: string;
  rating: number;
  notes: string;
  status: "reading" | "completed" | "to-read";
  pages: number;
  currentPage: number;
  dateRead: string | null;
  createdAt: string;
};

export function useBooks() {
  const [books, setBooks] = useState<BookNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = async () => {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      setBooks(data || []);
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (bookData: Omit<BookNote, 'id' | 'createdAt'>) => {
    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });
      const newBook = await response.json();
      setBooks(prev => [...prev, newBook]);
      return newBook;
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  };

  const updateBook = async (id: string, bookData: Partial<BookNote>) => {
    try {
      const response = await fetch(`/api/books?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });
      const updatedBook = await response.json();
      setBooks(prev => prev.map(book => book.id === id ? updatedBook : book));
      return updatedBook;
    } catch (error) {
      console.error('Failed to update book:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    addBook,
    updateBook,
    refresh: fetchBooks,
  };
}