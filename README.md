# CuidApoyo

Aplicación de apoyo a personas cuidadoras. Las páginas de recursos y el espacio local no requieren compilación; Comunidad utiliza PHP y SQLite.

## Abrir el proyecto

Inicia Live Server desde la raíz del repositorio y abre `index.html`.
La página de inicio está en la raíz; las otras seis páginas están en `html/`.
Para publicar solo los módulos estáticos, sirve la raíz completa del proyecto
junto con sus carpetas y usa `/index.html` como dirección de entrada.

## Organización

- `index.html`: página de inicio en la raíz.
- `html/`: tutoriales, recursos, chatbot, calendario y Mi cuenta.
- `css/`: estilos comunes, calendario y cuenta, sin cambios visuales.
- `js/`: script común y módulos en `calendario/`, `chatbot/` y `cuenta/`.
- `img/`: imágenes originales.
- `docs/`: documentación original de cada módulo y sus limitaciones.
- `html/pruebas/` y `js/pruebas/`: páginas y scripts de pruebas del calendario y chatbot.
- `pruebas/cuenta/`: ejecutores Node y resultados locales ignorados por Git.

## Verificación

Con Node 22 o posterior, desde la raíz:

```sh
node pruebas/cuenta/datos.cjs
node pruebas/cuenta/navegador.cjs
```

El segundo ejecutor requiere Chrome en Windows, inicia un servidor loopback,
usa un perfil temporal y guarda capturas e informes en
`pruebas/cuenta/resultados/`. También ejecuta las pruebas de calendario y chatbot.
Los módulos y las páginas de pruebas conservan sus funcionalidades originales.

## Archivos locales y datos

`.gitignore` excluye ZIP, `.vscode/`, `local/`, variables de entorno,
archivos de credenciales, dependencias y resultados generados.
Las dos configuraciones originales de VS Code se conservan localmente:
`.vscode/` y `local/CuidApoyo/.vscode/`.
El ZIP original también se conserva y queda excluido de la publicación.

La cuenta es un prototipo que almacena datos en el navegador; usa datos ficticios.
Los correos `example.test` y las contraseñas de las pruebas son ejemplos sintéticos.
La reorganización no cambia las claves del almacenamiento ni exporta los datos
locales del navegador. Consulta las limitaciones en `docs/cuenta/README.md`.
## Comunidad: cuentas y mensajería entre dispositivos

La aplicación incorpora un backend PHP con SQLite para Comunidad. Para usarlo, desde la raíz:

```powershell
& C:/xampp/php/php.exe -S 127.0.0.1:8085 servidor/router.php
```

Abre `http://127.0.0.1:8085/html/comunidad.html`. Live Server sigue sirviendo las páginas originales, pero Comunidad requiere PHP. El acceso social es independiente de las cuentas locales de cuidados: no se suben ni migran esos perfiles. Consulta [la guía de Comunidad](docs/comunidad/README.md) para configuración, dos cuentas, pruebas, archivos, seguridad y limitaciones.
