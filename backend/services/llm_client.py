from groq import Groq
from config import get_settings
import json

settings = get_settings()

class LLMClient:
    def __init__(self):
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = "llama-3.3-70b-versatile"
    
    def generate(self, prompt: str, system_prompt: str = None, temperature: float = 0.7) -> str:
        """Generate text using Groq LLM"""
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=4000
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"LLM Error: {e}")
            return ""
    
    def generate_json(self, prompt: str, system_prompt: str = None) -> dict:
        """Generate JSON response"""
        response = self.generate(prompt, system_prompt, temperature=0.3)
        
        if not response:
            print("Empty LLM response")
            return {}
        
        try:
            # Extract JSON from markdown code blocks if present
            if "```json" in response:
                response = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                response = response.split("```")[1].split("```")[0].strip()
            
            # Parse JSON
            result = json.loads(response)
            print(f"Successfully parsed JSON with {len(result)} fields")
            return result
        except json.JSONDecodeError as e:
            print(f"JSON Parse Error: {e}")
            print(f"Response (first 500 chars): {response[:500]}")
            # Try to extract JSON from the response
            try:
                # Find first { and last }
                start = response.find('{')
                end = response.rfind('}')
                if start != -1 and end != -1:
                    json_str = response[start:end+1]
                    result = json.loads(json_str)
                    print("Successfully extracted JSON from response")
                    return result
            except:
                pass
            return {}

def get_llm_client() -> LLMClient:
    return LLMClient()
