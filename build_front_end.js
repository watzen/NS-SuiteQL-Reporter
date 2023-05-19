const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const projectRoot = __dirname

// Get command line arguments
const frontendPath = process.argv[2]
const destinationPath = process.argv[3]

if (!frontendPath || !destinationPath) {
    console.error('Usage: node build.js <frontendPath> <destinationPath>')
    process.exit(1)
}

const frontendBuildPath = path.join(frontendPath, 'dist')
const sourceIndexPath = path.join(frontendBuildPath, 'index.html')
const destinationIndexPath = path.join(destinationPath, 'index.html')

try {
    // Run frontend build
    execSync(`npm run --prefix "${frontendPath}" build`, { stdio: 'inherit' })

    // Copy index.html
    fs.copyFileSync(sourceIndexPath, destinationIndexPath)

    // Run main build
    //execSync('npm run build', { stdio: 'inherit' })

    console.log('Build process completed successfully.')
} catch (error) {
    console.error('An error occurred during the build process:', error.message)
}
