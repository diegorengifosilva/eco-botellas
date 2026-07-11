import urllib.request
import urllib.error
import json

url = "http://127.0.0.1:8000/api/auth/register/"
data = {
    "nombre": "Test3",
    "familia": "TestFamily3",
    "salon": "3 anos",
    "usuario": "testuser3",
    "password": "testpassword123"
}

req = urllib.request.Request(
    url, 
    data=json.dumps(data).encode('utf-8'),
    headers={
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173',
        'Authorization': 'Bearer invalidtoken1234567890',
        'User-Agent': 'Mozilla/5.0'
    }
)

try:
    with urllib.request.urlopen(req) as response:
        print("STATUS CODE:", response.status)
        print("HEADERS:", dict(response.headers))
        print("CONTENT:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP ERROR:", e.code)
    print("HTTP ERROR HEADERS:", dict(e.headers))
    print("HTTP ERROR CONTENT:", e.read().decode('utf-8'))
except Exception as e:
    print("ERROR:", e)
