import axios from 'axios';
import { getSchema } from './db';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function generateSQL(nlQuery: string) {
    const schema = getSchema();

    const prompt = `
    You are a SQL expert. Translate the following natural language query into a valid SQLite SQL query using the provided schema.
    
    Schema:
    ${schema}
    
    Rules:
    - Return ONLY the SQL code block.
    - Do not explain the code.
    - Support joins, aggregations, subqueries, filtering, and sorting as needed.
    - Ensure logical consistency with the schema.
    
    Query: ${nlQuery}
  `;

    try {
        const response = await axios.post(
            OPENROUTER_URL,
            {
                model: 'google/gemini-2.0-flash-001', // Good balance of speed and reasoning
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://localhost:3000', // Site URL
                    'X-Title': 'Self-Service Analytics Agent', // Site Title
                },
            }
        );

        let sql = response.data.choices[0].message.content;
        // Clean up markdown code blocks if present
        sql = sql.replace(/```(sqlite|sql)?/gi, '').replace(/```/g, '').trim();

        return sql;
    } catch (error: any) {
        console.error('Error generating SQL:', error.response?.data || error.message);
        throw new Error('Failed to generate SQL.');
    }
}

export async function validateSQL(sql: string, nlQuery: string) {
    const schema = getSchema();

    const prompt = `
    Check the following SQL query for syntax correctness and logical consistency based on the schema and the original natural language query.
    
    Schema:
    ${schema}
    
    Original Query: ${nlQuery}
    Generated SQL: ${sql}
    
    Rules:
    - If correct, return "VALID".
    - If there is a mistake, explain the mistake and provide the corrected SQL.
    - Return ONLY "VALID" or the explanation + corrected SQL.
  `;

    try {
        const response = await axios.post(
            OPENROUTER_URL,
            {
                model: 'google/gemini-2.0-flash-001',
                messages: [{ role: 'user', content: prompt }],
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        const result = response.data.choices[0].message.content.trim();
        return result;
    } catch (error: any) {
        console.error('Error validating SQL:', error.response?.data || error.message);
        throw new Error('Failed to validate SQL.');
    }
}
