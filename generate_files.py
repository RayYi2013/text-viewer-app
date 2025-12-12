
content = """
你好，世界！
这是一个测试文件。
Encoding: GBK
"""
with open('test_gbk.txt', 'w', encoding='gbk') as f:
    f.write(content)

with open('test_utf8.txt', 'w', encoding='utf-8') as f:
    f.write(content.replace("GBK", "UTF-8"))
