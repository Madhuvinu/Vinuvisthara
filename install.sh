#!/bin/bash

###############################################################################
# Vinuvisthara Project - Complete Installation Script
# This script installs all dependencies and sets up the project
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project Requirements Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Vinuvisthara Project Installation${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Project Requirements:${NC}"
echo "  - PHP: 8.2+"
echo "  - Node.js: 18+ (recommended: 20)"
echo "  - MySQL: 8.0+ (or PostgreSQL)"
echo "  - Composer: Latest"
echo "  - Nginx: Latest"
echo "  - Laravel: 11.0"
echo "  - Next.js: 14.0.4"
echo ""

# Detect OS
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            OS=$ID
            OS_VERSION=$VERSION_ID
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    else
        echo -e "${RED}Unsupported OS. This script supports Ubuntu/Debian, CentOS/RHEL, and macOS.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Detected OS: $OS${NC}"
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ] && [[ "$OS" != "macos" ]]; then
        echo -e "${YELLOW}Note: Some commands may require sudo. You may be prompted for password.${NC}"
    fi
}

# Install PHP 8.2 and extensions (Ubuntu/Debian)
install_php_ubuntu() {
    echo -e "${BLUE}Installing PHP 8.2 and extensions (Ubuntu/Debian)...${NC}"
    
    sudo apt update
    sudo apt install -y software-properties-common
    sudo add-apt-repository ppa:ondrej/php -y
    sudo apt update
    
    sudo apt install -y \
        php8.2 \
        php8.2-fpm \
        php8.2-cli \
        php8.2-common \
        php8.2-mysql \
        php8.2-zip \
        php8.2-gd \
        php8.2-mbstring \
        php8.2-curl \
        php8.2-xml \
        php8.2-bcmath \
        php8.2-intl \
        php8.2-redis \
        php8.2-sqlite3 \
        php8.2-opcache
    
    echo -e "${GREEN}PHP 8.2 installed successfully${NC}"
    php -v
}

# Install PHP 8.2 and extensions (CentOS/RHEL)
install_php_centos() {
    echo -e "${BLUE}Installing PHP 8.2 and extensions (CentOS/RHEL)...${NC}"
    
    sudo yum install -y epel-release
    sudo yum install -y https://rpms.remirepo.net/enterprise/remi-release-8.rpm
    
    sudo yum module reset php -y
    sudo yum module enable php:remi-8.2 -y
    
    sudo yum install -y \
        php \
        php-fpm \
        php-cli \
        php-mysqlnd \
        php-zip \
        php-gd \
        php-mbstring \
        php-curl \
        php-xml \
        php-bcmath \
        php-intl \
        php-redis \
        php-opcache
    
    echo -e "${GREEN}PHP 8.2 installed successfully${NC}"
    php -v
}

# Install PHP (macOS)
install_php_macos() {
    echo -e "${BLUE}Installing PHP 8.2 via Homebrew (macOS)...${NC}"
    
    if ! command -v brew &> /dev/null; then
        echo -e "${YELLOW}Homebrew not found. Installing Homebrew...${NC}"
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    brew install php@8.2
    brew link php@8.2
    
    echo -e "${GREEN}PHP 8.2 installed successfully${NC}"
    php -v
}

# Install Composer
install_composer() {
    echo -e "${BLUE}Installing Composer...${NC}"
    
    if command -v composer &> /dev/null; then
        echo -e "${YELLOW}Composer already installed. Updating...${NC}"
        composer self-update
    else
        cd ~
        curl -sS https://getcomposer.org/installer | php
        sudo mv composer.phar /usr/local/bin/composer
        sudo chmod +x /usr/local/bin/composer
    fi
    
    echo -e "${GREEN}Composer installed successfully${NC}"
    composer --version
}

# Install Node.js 20
install_nodejs() {
    echo -e "${BLUE}Installing Node.js 20...${NC}"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            echo -e "${YELLOW}Node.js $(node -v) already installed${NC}"
            return
        fi
    fi
    
    if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt install -y nodejs
    elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
        sudo yum install -y nodejs
    elif [[ "$OS" == "macos" ]]; then
        if ! command -v brew &> /dev/null; then
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install node@20
    fi
    
    echo -e "${GREEN}Node.js installed successfully${NC}"
    node -v
    npm -v
}

# Install MySQL (Ubuntu/Debian)
install_mysql_ubuntu() {
    echo -e "${BLUE}Installing MySQL...${NC}"
    
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    echo -e "${GREEN}MySQL installed successfully${NC}"
    echo -e "${YELLOW}Please run 'sudo mysql_secure_installation' to secure MySQL${NC}"
}

# Install MySQL (CentOS/RHEL)
install_mysql_centos() {
    echo -e "${BLUE}Installing MySQL...${NC}"
    
    sudo yum install -y mysql-server
    sudo systemctl start mysqld
    sudo systemctl enable mysqld
    
    echo -e "${GREEN}MySQL installed successfully${NC}"
    echo -e "${YELLOW}Please run 'sudo mysql_secure_installation' to secure MySQL${NC}"
}

# Install MySQL (macOS)
install_mysql_macos() {
    echo -e "${BLUE}Installing MySQL via Homebrew...${NC}"
    
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    brew install mysql
    brew services start mysql
    
    echo -e "${GREEN}MySQL installed successfully${NC}"
}

# Install Nginx
install_nginx() {
    echo -e "${BLUE}Installing Nginx...${NC}"
    
    if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
        sudo apt install -y nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
    elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]]; then
        sudo yum install -y nginx
        sudo systemctl start nginx
        sudo systemctl enable nginx
    elif [[ "$OS" == "macos" ]]; then
        if ! command -v brew &> /dev/null; then
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        fi
        brew install nginx
        brew services start nginx
    fi
    
    echo -e "${GREEN}Nginx installed successfully${NC}"
}

# Install PM2 (Process Manager for Node.js)
install_pm2() {
    echo -e "${BLUE}Installing PM2...${NC}"
    sudo npm install -g pm2
    echo -e "${GREEN}PM2 installed successfully${NC}"
}

# Setup project dependencies
setup_project() {
    echo -e "${BLUE}Setting up project dependencies...${NC}"
    
    # Get project directory
    PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Backend setup
    if [ -d "$PROJECT_DIR/backend-laravel" ]; then
        echo -e "${BLUE}Installing Laravel dependencies...${NC}"
        cd "$PROJECT_DIR/backend-laravel"
        
        if [ ! -f "composer.json" ]; then
            echo -e "${RED}composer.json not found in backend-laravel directory${NC}"
            return
        fi
        
        composer install --optimize-autoloader --no-dev
        
        if [ ! -f ".env" ]; then
            if [ -f ".env.example" ]; then
                cp .env.example .env
                echo -e "${GREEN}Created .env file from .env.example${NC}"
                echo -e "${YELLOW}Please edit backend-laravel/.env with your database credentials${NC}"
            fi
        fi
        
        echo -e "${GREEN}Laravel dependencies installed${NC}"
    else
        echo -e "${YELLOW}backend-laravel directory not found${NC}"
    fi
    
    # Frontend setup
    if [ -d "$PROJECT_DIR/frontend" ]; then
        echo -e "${BLUE}Installing Next.js dependencies...${NC}"
        cd "$PROJECT_DIR/frontend"
        
        if [ ! -f "package.json" ]; then
            echo -e "${RED}package.json not found in frontend directory${NC}"
            return
        fi
        
        npm install
        
        if [ ! -f ".env.local" ]; then
            echo -e "${YELLOW}Please create frontend/.env.local with NEXT_PUBLIC_API_URL${NC}"
        fi
        
        echo -e "${GREEN}Next.js dependencies installed${NC}"
    else
        echo -e "${YELLOW}frontend directory not found${NC}"
    fi
}

# Main installation function
main() {
    detect_os
    check_root
    
    echo -e "${BLUE}Starting installation...${NC}"
    echo ""
    
    # Install PHP
    if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
        install_php_ubuntu
        install_mysql_ubuntu
    elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]]; then
        install_php_centos
        install_mysql_centos
    elif [[ "$OS" == "macos" ]]; then
        install_php_macos
        install_mysql_macos
    fi
    
    # Install common dependencies
    install_composer
    install_nodejs
    install_nginx
    install_pm2
    
    # Setup project
    setup_project
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Installation Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Configure database:"
    echo "   - Create database: CREATE DATABASE vinuvisthara;"
    echo "   - Update backend-laravel/.env with database credentials"
    echo ""
    echo "2. Setup Laravel:"
    echo "   cd backend-laravel"
    echo "   php artisan key:generate"
    echo "   php artisan migrate"
    echo "   php artisan storage:link"
    echo ""
    echo "3. Configure frontend:"
    echo "   - Create frontend/.env.local with NEXT_PUBLIC_API_URL"
    echo "   - Build: cd frontend && npm run build"
    echo ""
    echo "4. Configure Nginx (see documentation)"
    echo ""
}

# Run main function
main
