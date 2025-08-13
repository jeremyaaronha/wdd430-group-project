import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

type Ctx = { params: { id: string } };

export async function PUT(req: Request, ctx: unknown) {
  const { params } = ctx as Ctx;

  try {
    const productId = Number(params.id);
    if (!Number.isFinite(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const { name, price, category, description, imageUrl } = await req.json();

    await sql`
      UPDATE products
      SET
        name        = COALESCE(${name}, name),
        price       = COALESCE(${price}, price),
        category    = COALESCE(${category}, category),
        description = COALESCE(${description}, description),
        image_url   = COALESCE(${imageUrl}, image_url)
      WHERE id = ${productId}
    `;

    const updated = await sql`SELECT * FROM products WHERE id = ${productId} LIMIT 1`;
    return NextResponse.json({ success: true, product: updated.rows[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Error updating product' }, { status: 500 });
  }
}