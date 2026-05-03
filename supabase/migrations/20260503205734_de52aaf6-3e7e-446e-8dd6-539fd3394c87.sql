-- Add tropa_config column to site_content table
ALTER TABLE public.site_content 
ADD COLUMN IF NOT EXISTS tropa_config JSONB DEFAULT '{
  "heading": "A Tropa Invadiu",
  "heading_em": "Seu Casamento",
  "subheading": "A hora da gravata nunca mais será a mesma.",
  "paragraphs": [
    "A hora da gravata é uma das tradições mais antigas dos casamentos brasileiros — surgiu com os imigrantes italianos e espanhóis no início do século XX e virou costume até hoje. O ritual é simples: logo após a sobremesa, padrinhos e amigos saem de mesa em mesa com a gravata do noivo, pedem contribuições para a lua de mel e quem colabora leva um pedacinho como lembrança.",
    "Bonito no papel. Na prática? Sem uma tropa treinada, vira uma bandeja de isopor, uma piada sem graça e o noivo travado sem saber o que fazer.",
    "Foi aí que a Tropa da Gravata entrou em operação.",
    "Inspirada nos personagens do BOPE imortalizados no filme Tropa de Elite, nossa equipe invade o salão fardada, disciplinada e com energia de missão cumprida — transformando a hora da gravata em um espetáculo à parte. Os agentes dominam o ambiente, envolvem os convidados com humor afiado e criam um momento que todo mundo vai lembrar — inclusive aquele tio que estava tentando escapar.",
    "O plano é simples: entrar, surpreender e sair com a missão cumprida."
  ],
  "image_url": "https://rmetppilvfrxosvxzhgj.supabase.co/storage/v1/object/public/message-attachments/fa1e2554-75eb-47f0-ba93-607583130d73/Instagram_files/561755360_18109376935599626_8280922716105922460_n.jpg",
  "cta_label": "Contrate Agora",
  "instagram_url": "https://www.instagram.com/tropadagravata/",
  "instagram_label": "Ver no Instagram"
}'::jsonb;