
const backupUrl = "https://lcjuezugcqdffweyhlkb.supabase.co/storage/v1/object/authenticated/backups/backup-020decf1-63f6-4eeb-8b3d-7c38f03cc28e.json";
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjanVlenVnY3FkZmZ3ZXlobGtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUyNzUwNCwiZXhwIjoyMDkzMTAzNTA0fQ.1zEvWDIRMn6wY3AWSMEQ6BC57gsI6xLkyIMiGgNz9dQ";

async function restore() {
  const res = await fetch(backupUrl, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  const data = await res.json();
  const posts = data.tables.instagram_posts;
  
  if (!posts || posts.length === 0) {
    console.log("No posts found in backup.");
    return;
  }

  console.log(`Found ${posts.length} posts. Generating SQL...`);
  
  const sql = posts.map(p => {
    const fields = ['id', 'image_url', 'caption', 'permalink', 'position', 'is_published', 'source', 'posted_at', 'created_at', 'updated_at'];
    const values = fields.map(f => {
      const val = p[f];
      if (val === null) return 'NULL';
      if (typeof val === 'boolean') return val ? 'true' : 'false';
      if (typeof val === 'number') return val;
      return `'${String(val).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO instagram_posts (${fields.join(', ')}) VALUES (${values.join(', ')});`;
  }).join('\n');

  console.log(sql);
}

restore();
