import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';
dotenv.config();
// Create PostgreSQL connection pool
// Prefer individual parameters over DATABASE_URL to avoid URL encoding issues
let poolConfig: any;

// Check if we have individual DB parameters set
const hasIndividualParams = process.env.DB_HOST || process.env.DB_NAME || process.env.DB_USER;
console.log(hasIndividualParams);
if (hasIndividualParams && !process.env.DATABASE_URL) {
  // Use individual connection parameters (more reliable with special characters in password)
  const password = process.env.DB_PASSWORD;
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'chatbot',
    user: process.env.DB_USER || 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
  
  // Only add password if it's provided and not empty
  if (password && password.trim() !== '') {
    poolConfig.password = password;
  }
} else if (process.env.DATABASE_URL) {
  // Use connection string if provided (make sure password is URL-encoded)
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
} else {
  // Default fallback
  poolConfig = {
    host: 'localhost',
    port: 5432,
    database: 'chatbot',
    user: 'postgres',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err);
});

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// Initialize schema
export async function initializeDatabase(): Promise<void> {
  try {
    const { readFileSync } = await import('fs');
    const { join } = await import('path');
    const { existsSync } = await import('fs');
    
    // Handle both development (tsx) and production (compiled) paths
    let schemaPath = join(__dirname, 'schema.sql');
    
    if (!existsSync(schemaPath)) {
      // Try alternative paths
      const altPath = join(__dirname, '..', 'db', 'schema.sql');
      if (existsSync(altPath)) {
        schemaPath = altPath;
      } else {
        const cwdPath = join(process.cwd(), 'src', 'db', 'schema.sql');
        if (existsSync(cwdPath)) {
          schemaPath = cwdPath;
        } else {
          throw new Error(`Schema file not found. Tried: ${schemaPath}, ${altPath}, ${cwdPath}`);
        }
      }
    }
    
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // Remove comments and split by semicolon
    const cleanedSchema = schema
      .split('\n')
      .map(line => {
        // Remove inline comments
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n');
    
    // Split by semicolon and filter empty statements
    const statements = cleanedSchema
      .split(';')
      .map(s => s.trim().replace(/\s+/g, ' '))
      .filter(s => s.length > 0 && !s.match(/^\s*$/));
    
    console.log(`Found ${statements.length} schema statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`);
        await pool.query(statement + ';'); // Add semicolon back
      } catch (error: any) {
        // Ignore "already exists" errors
        if (error.code === '42P07' || error.code === '42710') {
          console.log(`  ✓ Already exists, skipping`);
          continue;
        }
        console.error(`  ✗ Error: ${error.message}`);
        console.error(`  Code: ${error.code}`);
        throw error;
      }
    }
    
    console.log('✅ Database schema initialized successfully');
  } catch (error: any) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

// Conversation operations
export const conversationQueries = {
  create: async (id: string): Promise<Conversation> => {
    const result = await pool.query(
      `INSERT INTO conversations (id, created_at, updated_at)
       VALUES ($1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id]
    );
    return result.rows[0] as Conversation;
  },

  getById: async (id: string): Promise<Conversation | null> => {
    const result = await pool.query(
      'SELECT * FROM conversations WHERE id = $1',
      [id]
    );
    return result.rows[0] as Conversation || null;
  },

  updateTimestamp: async (id: string): Promise<void> => {
    await pool.query(
      'UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  },
};

// Message operations
export const messageQueries = {
  create: async (
    id: string,
    conversationId: string,
    sender: 'user' | 'ai',
    text: string
  ): Promise<Message> => {
    const result = await pool.query(
      `INSERT INTO messages (id, conversation_id, sender, text, timestamp)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
       RETURNING *`,
      [id, conversationId, sender, text]
    );
    return result.rows[0] as Message;
  },

  getByConversationId: async (conversationId: string): Promise<Message[]> => {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 
       ORDER BY timestamp ASC`,
      [conversationId]
    );
    return result.rows as Message[];
  },

  getLatest: async (conversationId: string, limit: number): Promise<Message[]> => {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [conversationId, limit]
    );
    return result.rows.reverse() as Message[]; // Reverse to get chronological order
  },
};

// Close pool (for cleanup)
export async function closeDatabase(): Promise<void> {
  await pool.end();
}

export default pool;
