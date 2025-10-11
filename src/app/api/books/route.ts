import { NextRequest, NextResponse } from "next/server";
import { db, books } from "@/lib/db";
import { eq } from "drizzle-orm";

// GET /api/books - Get all books
export async function GET() {
  try {
    const allBooks = await db.select().from(books);
    return NextResponse.json(allBooks);
  } catch {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

// POST /api/books - Create a new book
export async function POST(request: NextRequest) {
  try {
    const bookData = await request.json();
    
    const [newBook] = await db.insert(books).values({
      title: bookData.title,
      author: bookData.author,
      rating: bookData.rating || 0,
      notes: bookData.notes || "",
      status: bookData.status || "to-read",
      pages: bookData.pages || 0,
      currentPage: bookData.currentPage || 0,
      dateRead: bookData.dateRead,
    }).returning();
    
    return NextResponse.json(newBook);
  } catch {
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

// PUT /api/books/[id] - Update a book
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const bookData = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: "Book ID required" }, { status: 400 });
    }
    
    const [updatedBook] = await db.update(books)
      .set({
        title: bookData.title,
        author: bookData.author,
        rating: bookData.rating,
        notes: bookData.notes,
        status: bookData.status,
        pages: bookData.pages,
        currentPage: bookData.currentPage,
        dateRead: bookData.dateRead,
      })
      .where(eq(books.id, id))
      .returning();
    
    return NextResponse.json(updatedBook);
  } catch {
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}