from http.server import BaseHTTPRequestHandler, HTTPServer
import mysql.connector
import socketserver
import json
from datetime import date
import urllib.parse
import re

class CustomJSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, date):
            return o.strftime('%Y-%m-%d')
        return json.JSONEncoder.default(self, o)

def getClientes():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database="corretorabd"
    )
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM Cliente')
    users = cursor.fetchall()
    cursor.close()
    connection.close()
    return users

def getClientePorId(cliente_id):
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database="corretorabd"
    )
    cursor = connection.cursor(dictionary=True)
    query = "SELECT * FROM Cliente WHERE id = %s"
    cursor.execute(query, (cliente_id,))
    cliente = cursor.fetchone()
    cursor.close()
    connection.close()
    return cliente


def getPlanoSeguroPorClienteId(cliente_id):
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database="corretorabd"
    )
    cursor = connection.cursor(dictionary=True)
    query = "SELECT * FROM PlanoSeguro WHERE fk_cliente_id = %s"
    cursor.execute(query, (cliente_id,))
    plano = cursor.fetchone()
    cursor.close()
    connection.close()
    return plano


def deleteCliente(cliente_id):
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database="corretorabd"
    )
    cursor = connection.cursor()

    try:
        delete_queries = [
            "DELETE FROM PessoaFisica WHERE fk_cliente_id = %s",
            "DELETE FROM PessoaJuridica WHERE fk_cliente_id = %s",
            "DELETE FROM Realiza_Ativacoes_Cliente_Plano_Seguro WHERE fk_cliente_id = %s",  
            "DELETE FROM vende_corretor_seguros_cliente_plano_de_seguro WHERE fk_cliente_id = %s"
        ]
        
        for query in delete_queries:
            cursor.execute(query, (cliente_id,))

        cursor.execute("DELETE FROM PlanoSeguro WHERE fk_cliente_id = %s", (cliente_id,))

        cursor.execute("DELETE FROM Cliente WHERE id = %s", (cliente_id,))

        connection.commit()
    except mysql.connector.Error as err:
        print(f"Erro ao deletar cliente: {err}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()


def deletePlanoSeguro(plano_seguro_id):
    connection = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database="corretorabd"
    )
    cursor = connection.cursor()

    try:
        delete_queries = [
            "DELETE FROM Realiza_Ativacoes_Cliente_Plano_Seguro WHERE fk_PlanoSeguro_id = %s",
            "DELETE FROM vende_corretor_seguros_cliente_plano_de_seguro WHERE fk_PlanoSeguro_id = %s"
        ]
        
        for query in delete_queries:
            cursor.execute(query, (plano_seguro_id,))

        delete_query_ps = "DELETE FROM PlanoSeguro WHERE ID = %s"
        cursor.execute(delete_query_ps, (plano_seguro_id,))

        connection.commit()
    except mysql.connector.Error as err:
        print(f"Erro ao deletar plano de seguro: {err}")
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

class Requisicoes(BaseHTTPRequestHandler):

    def _set_headers(self, status_code=200):
        self.send_response(status_code)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
        self.end_headers()

    def do_OPTIONS(self): 
        self._set_headers(200)

    def do_GET(self): 
        cliente_match = re.match(r"/cliente/(\d+)", self.path)
        seguro_match = re.match(r"/seguro/cliente/(\d+)", self.path)

        if cliente_match:
            cliente_id = cliente_match.group(1)
            self._set_headers(200)
            cliente = getClientePorId(cliente_id)
            self.wfile.write(json.dumps(cliente).encode())

        elif seguro_match:
            cliente_id = seguro_match.group(1)
            self._set_headers(200)
            plano = getPlanoSeguroPorClienteId(cliente_id)
            self.wfile.write(json.dumps(plano, cls=CustomJSONEncoder).encode())


        elif self.path == '/clientes':
            self._set_headers(200)
            clientes = getClientes()
            self.wfile.write(json.dumps(clientes).encode())
 

 
    def do_POST(self):
        if self.path == '/novoCliente':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)
            connection = mysql.connector.connect(
                host='localhost',
                user='root',
                password='',
                database="corretorabd"
            )
            cursor = connection.cursor()
            insert_query = "INSERT INTO Cliente (nome, telefone, email, genero, cep, rua, bairro, numero) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
            cursor.execute(insert_query, (data['nome'], data['telefone'], data['email'], data['genero'], data['cep'], data['rua'], data['bairro'], data['numero']))

            connection.commit()
            cliente_id = cursor.lastrowid  # Obtém o ID do último cliente inserido
            cursor.close()
            connection.close()

            self._set_headers(200)
            self.wfile.write(json.dumps({'status': 'sucesso', 'cliente_id': cliente_id}).encode())

        elif self.path == '/novoSeguro':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data)

            cliente_id = data['fk_cliente_id']

            connection = mysql.connector.connect(
                host='localhost',
                user='root',
                password='',
                database="corretorabd"
            )
            cursor = connection.cursor()

            insert_query = """
            INSERT INTO PlanoSeguro (
            tipo_viagem, tipo_cobertura, status_cliente, status_pagamento, 
            data_pagamento, data_saida, data_volta, transporte, 
            destino, fk_seguradora_cnpj, fk_cliente_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(insert_query, (
                data['tipo_viagem'], data['tipo_cobertura'], data['status_cliente'], 
                data['status_pagamento'], data['data_pagamento'], data['data_saida'], 
                data['data_volta'], data['transporte'], data['destino'], 
                data['fk_seguradora_cnpj'], cliente_id
            ))

            connection.commit()
            cursor.close()
            connection.close()

            self._set_headers(200)
            self.wfile.write(json.dumps({'status': 'sucesso'}).encode())


    def do_DELETE(self):
        cliente_match = re.match(r"/cliente/(\d+)", self.path)
        plano_seguro_match = re.match(r"/planoSeguro/(\d+)", self.path)

        if cliente_match:
            cliente_id = int(cliente_match.group(1))
            try:
                deleteCliente(cliente_id)
                self._set_headers()
                self.wfile.write(json.dumps({'status': 'sucesso'}).encode())
            except Exception as e:
                print(f"Erro ao deletar cliente: {e}")
                self.send_error(500, f"Erro interno: {e}")

        elif plano_seguro_match:
            plano_seguro_id = int(plano_seguro_match.group(1))
            try:
                deletePlanoSeguro(plano_seguro_id)
                self._set_headers()
                self.wfile.write(json.dumps({'status': 'sucesso'}).encode())
            except Exception as e:
                print(f"Erro ao deletar plano de seguro: {e}")
                self.send_error(500, f"Erro interno: {e}")

        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({'status': 'falha', 'erro': 'Rota não encontrada'}).encode())


def run(server_class=HTTPServer, port=8080):
    server_address = ('', port)
    httpd = socketserver.TCPServer(("", port), Requisicoes)
    print(f'Starting httpd server on port {port}...')
    httpd.serve_forever()

if __name__ == "__main__":
    run()

       


 



 
 










