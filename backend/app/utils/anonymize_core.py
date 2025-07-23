import json
import requests
import os
import re

def read_file_content(content: str) -> str:
    return content

def read_prompt_file(file_path):
    try:
        script_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        full_path = os.path.join(script_dir, file_path)
        with open(full_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        raise Exception(f"Error: Prompt file not found: {file_path}")
    except Exception as e:
        raise Exception(f"Error reading prompt file {file_path}: {str(e)}")

def create_prompt(user_prompt_template, cv_content):
    """Crea el prompt final combinando el template y el contenido del CV."""
    if "[PASTE HERE THE CONTENT OF THE CV]" in user_prompt_template:
        prompt = user_prompt_template.replace("[PASTE HERE THE CONTENT OF THE CV]", cv_content)
    else:
        prompt = f"{user_prompt_template}\n{cv_content}"
    return prompt

def call_ollama_api(system_prompt, user_prompt, api_url, api_key):
    """Llama a la API de Ollama para procesar los prompts."""
    combined_prompt = f"{system_prompt}\n{user_prompt}"

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "model": "gemma3:12b",
        "prompt": combined_prompt,
        "stream": False,
        "options": {
            "temperature": 0.1,
            "top_p": 0.3,
            "min_p": 0.05,
            "top_k": 20
        }
    }
    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=120)
        response.raise_for_status()
        response_data = response.json()
        if "response" not in response_data:
            error_msg = f"⚠️ Estructura de respuesta inesperada. Claves disponibles: {list(response_data.keys())}"
            print(error_msg)
            print(f"Respuesta completa (primeros 500 chars): {json.dumps(response_data, indent=2)[:500]}...")
            raise Exception(error_msg)
        content = response_data["response"]
        return content
    except requests.exceptions.Timeout:
        raise Exception("La solicitud a la API de Ollama excedió el tiempo límite.")
    except requests.exceptions.RequestException as e:
        raise Exception(f"Fallo en la llamada a la API: {str(e)}")
    except (KeyError, IndexError) as e:
        raise Exception(f"Formato de respuesta de la API inesperado: {str(e)}. Respuesta JSON completa: {json.dumps(response_data, indent=2)}")

def extract_json_from_response(response_content):
    """Extrae el objeto JSON del contenido de la respuesta de la API."""
    clean_content = clean_invisible_characters(response_content)
    json_object_pattern = r'\{[\s\S]*\}'
    json_match = re.search(json_object_pattern, clean_content)
    if json_match:
        return json_match.group(0).strip()
    return clean_content.strip()

def clean_invisible_characters(text):
    cleaned_text = ""
    for char in text:
        if char.isprintable():
            cleaned_text += char
        elif char in [' ', '\t', '\n', '\r']:
            cleaned_text += char
    return cleaned_text

def split_cv_content(cv_content, max_chars=1500):
    if len(cv_content) <= max_chars:
        return [cv_content]
    
    print(f"CV de {len(cv_content)} caracteres será dividido en partes de máximo {max_chars} caracteres")
    
    parts = []
    current_part = ""
    
    # Dividir por párrafos (doble salto de línea)
    paragraphs = cv_content.split('\n\n')
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        # Si agregar este párrafo excede el límite
        if len(current_part + '\n\n' + paragraph) > max_chars and current_part:
            parts.append(current_part.strip())
            current_part = paragraph
        else:
            if current_part:
                current_part += '\n\n' + paragraph
            else:
                current_part = paragraph
        
        # Si un párrafo individual es muy largo, dividirlo por líneas
        if len(current_part) > max_chars:
            lines = current_part.split('\n')
            temp_part = ""
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                    
                if len(temp_part + '\n' + line) > max_chars and temp_part:
                    parts.append(temp_part.strip())
                    temp_part = line
                else:
                    if temp_part:
                        temp_part += '\n' + line
                    else:
                        temp_part = line
                
                # Si una línea individual es extremadamente larga, dividirla por palabras
                if len(temp_part) > max_chars:
                    words = temp_part.split()
                    word_part = ""
                    
                    for word in words:
                        if len(word_part + ' ' + word) > max_chars and word_part:
                            parts.append(word_part.strip())
                            word_part = word
                        else:
                            if word_part:
                                word_part += ' ' + word
                            else:
                                word_part = word
                    
                    temp_part = word_part
            
            current_part = temp_part
    
    # Agregar la última parte si no está vacía
    if current_part.strip():
        parts.append(current_part.strip())
    
    # Filtrar partes vacías y muy pequeñas
    parts = [part for part in parts if len(part.strip()) > 10]
    
    print(f"CV dividido en {len(parts)} partes")
    for i, part in enumerate(parts, 1):
        print(f"  Parte {i}: {len(part)} caracteres")
    
    return parts


def combine_mappings(mapping_list):
    combined_mapping = {}
    used_labels = set()
    for mapping in mapping_list:
        for label, value in mapping.items():
            existing_label = None
            for existing_label_key, existing_value in combined_mapping.items():
                if existing_value == value:
                    existing_label = existing_label_key
                    break

            if existing_label:
                print(f"  - Valor duplicado exacto encontrado: '{value}' (ya como '{existing_label}'). Ignorado.")
                continue

            original_label = label
            counter = 1
            while label in used_labels:
                label = f"{original_label}_{counter}"
                counter += 1

            combined_mapping[label] = value
            used_labels.add(label)
    return combined_mapping



def process_cv_parts(cv_parts, system_prompt, user_prompt_template, api_url, api_key):
    mappings = []
    total_parts = len(cv_parts)
    for i, part in enumerate(cv_parts, 1):
        print(f"\nProcesando parte {i}/{total_parts} del CV ({len(part)} caracteres)...")
        user_prompt = create_prompt(user_prompt_template, part)

        if total_parts > 1:
            context_info = f"\nNOTA: Esta es la parte {i} de {total_parts} del CV completo. Procesa solo esta sección."
            user_prompt += context_info

        try:
            response_content = call_ollama_api(system_prompt, user_prompt, api_url, api_key)
            json_content = extract_json_from_response(response_content)
            json_content = clean_invisible_characters(json_content)

            mapping = json.loads(json_content)
            mappings.append(mapping)
            print(f"✓ Parte {i}: Se encontraron {len(mapping)} elementos para anonimizar")
            if mapping:
                sample_items = list(mapping.items())[:3]
                for key, value in sample_items:
                    print(f"  - {key}: {value}")
                if len(mapping) > 3:
                    print(f"  ... y {len(mapping) - 3} elementos más")
        except json.JSONDecodeError as e:
            print(f"❌ Error en JSON de la parte {i}: {str(e)}")
            print(f"Respuesta original completa (primeros 500 chars): {repr(response_content[:500])}")
            print(f"JSON extraído: {repr(json_content[:500])}")
            mappings.append({})
        except Exception as e:
            print(f"❌ Error procesando la parte {i}: {str(e)}")
            mappings.append({})
    return mappings

def anonymize_cv_content(cv_content: str, ollama_endpoint: str, ollama_key: str):
    try:
        system_prompt_path = os.path.join("prompts", "system_prompt.txt")
        user_prompt_path = os.path.join("prompts", "user_prompt.txt")

        print("Leyendo prompts del sistema y del usuario...")
        system_prompt = read_prompt_file(system_prompt_path)
        user_prompt_template = read_prompt_file(user_prompt_path)

        max_chars = 1500 
        cv_parts = split_cv_content(cv_content, max_chars)
        if len(cv_parts) > 1:
            print(f"CV dividido en {len(cv_parts)} partes debido a su tamaño")
        else:
            print("El CV se procesará como una sola parte")

        mappings = process_cv_parts(cv_parts, system_prompt, user_prompt_template, ollama_endpoint, ollama_key)

        combined_mapping = combine_mappings(mappings)
        print(f"Mapping combinado con {len(combined_mapping)} elementos únicos para anonimizar")

        return combined_mapping

    except Exception as e:
        print(f"Error en anonymize_cv_content: {e}")
        raise e