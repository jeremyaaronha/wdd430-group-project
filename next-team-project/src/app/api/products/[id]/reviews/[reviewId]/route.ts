import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

type Ctx = { params: { id: string; reviewId: string } };

export async function DELETE(req: Request, ctx: unknown) {
  const { params } = ctx as Ctx;

  const productId = Number(params.id);
  const reviewId = Number(params.reviewId);
  if (!Number.isFinite(productId) || !Number.isFinite(reviewId)) {
    return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await sql`
      SELECT 1
      FROM reviews
      WHERE id = ${reviewId}
        AND product_id = ${productId}
        AND user_email = ${email}
      LIMIT 1
    `;
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found or no permission' }, { status: 403 });
    }

    await sql`DELETE FROM reviews WHERE id = ${reviewId}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('reviews DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}