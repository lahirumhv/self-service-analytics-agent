import { NextRequest, NextResponse } from 'next/server';
import db from '../../../lib/db';
import { generateSQL, validateSQL } from '../../../lib/agent';

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // 1. Generate SQL
        let sql = await generateSQL(query);

        // 2. Validate SQL
        const validation = await validateSQL(sql, query);
        let validationNote = '';

        if (validation !== 'VALID') {
            validationNote = validation;
            // If validation returned a corrected SQL, we might want to extract it or just notify.
            // For this simple agent, we'll try to re-extract the SQL if it looks like there's one.
            const sqlMatch = validation.match(/SELECT[\s\S]+/i);
            if (sqlMatch) {
                sql = sqlMatch[0].replace(/```(sqlite|sql)?/gi, '').replace(/```/g, '').trim();
            }
        }

        // 3. Execute SQL
        const results = db.prepare(sql).all();

        return NextResponse.json({
            sql,
            results,
            validationNote: validationNote !== 'VALID' ? validationNote : null
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: error.message,
            detail: error.response?.data || null
        }, { status: 500 });
    }
}
