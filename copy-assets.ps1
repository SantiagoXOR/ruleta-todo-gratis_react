# Crear directorios si no existen
New-Item -ItemType Directory -Force -Path "public/sounds"
New-Item -ItemType Directory -Force -Path "public/assets/icons"
New-Item -ItemType Directory -Force -Path "public/assets/images"

# Copiar archivos de sonido
Copy-Item -Path "../sounds/*.mp3" -Destination "public/sounds/" -Force

# Copiar iconos
Copy-Item -Path "../assets/icons/*.svg" -Destination "public/assets/icons/" -Force

# Copiar imágenes
Copy-Item -Path "../assets/images/*.png" -Destination "public/assets/images/" -Force 