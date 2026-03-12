NEWS_EXTRACTION_PROMPT = """You are a news intelligence analyst. Your task is to find and summarize recent news about a company.

Company Name: {company_name}
Industry: {industry}

Generate a JSON response with recent news, funding rounds, and product launches for this company. Include realistic and relevant information.

Return ONLY valid JSON in this exact format:
{{
    "articles": [
        {{
            "title": "Article title",
            "summary": "2-3 sentence summary",
            "date": "2026-03-01",
            "url": "https://example.com/article",
            "relevance_score": 0.9
        }}
    ],
    "funding_rounds": [
        {{
            "amount": "$10M",
            "round": "Series A",
            "date": "2026-02-15",
            "investors": ["Investor Name"]
        }}
    ],
    "product_launches": [
        {{
            "product": "Product Name",
            "description": "Brief description",
            "date": "2026-01-20"
        }}
    ]
}}

Generate 2-3 realistic articles, and include funding/product info if relevant to the industry.
"""
