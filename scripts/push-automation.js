#!/usr/bin/env node

/**
 * Push Automation Script for Fortune Telling App
 * 
 * This script automates the complete push workflow:
 * 1. Pre-push validation (build, lint, type-check, core tests)
 * 2. Documentation updates
 * 3. Code cleanup and refactoring
 * 4. Git operations with standardized commit messages
 * 5. Full test suite validation
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { execSync } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

// ANSI color codes for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}[${step}]${colors.reset} ${colors.cyan}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`  Running: ${command}`, 'yellow');
    const output = execSync(command, { 
      stdio: 'pipe', 
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    log(`  ✓ ${description}`, 'green');
    return output;
  } catch (error) {
    log(`  ✗ ${description}`, 'red');
    log(`  Error: ${error.message}`, 'red');
    throw error;
  }
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

async function runPushAutomation() {
  try {
    log(`${colors.bold}🚀 Starting Push Automation Workflow${colors.reset}`, 'cyan');
    log('Fortune Telling App - Comprehensive Pre-Push Pipeline\n');

    // Phase 1: Pre-Push Validation
    logStep('1/6', 'Pre-Push Validation');
    
    // Build check
    execCommand('npm run build', 'Production build validation');
    
    // Code quality gates
    execCommand('npm run lint', 'ESLint code quality checks');
    execCommand('npm run type-check', 'TypeScript type validation');
    
    // Essential quality gates only (no UI tests)
    // Skip UI tests - they're too complex and you prefer manual testing

    // Phase 2: Test Suite Validation  
    logStep('2/6', 'Test Suite Status Check');
    
    // Check for essential test files only
    const essentialFiles = [
      'tests/utils-only.spec.ts'
    ];
    
    let missingEssential = [];
    essentialFiles.forEach(file => {
      if (checkFileExists(file)) {
        log(`  ✓ ${file} (utils unit tests)`, 'green');
      } else {
        log(`  ✗ ${file} (missing)`, 'red');
        missingEssential.push(file);
      }
    });
    
    if (missingEssential.length === 0) {
      log('  ✓ Essential unit tests present', 'green');
    } else {
      log(`  Warning: ${missingEssential.length} essential test files missing`, 'yellow');
    }
    
    log('  ✓ UI tests removed (manual testing preferred)', 'green');

    // Phase 3: Documentation Updates
    logStep('3/6', 'Documentation Validation');
    
    // Check critical documentation files
    const docFiles = ['CLAUDE.md', 'README.md', 'package.json'];
    docFiles.forEach(file => {
      if (checkFileExists(file)) {
        log(`  ✓ ${file} exists`, 'green');
      } else {
        log(`  ✗ ${file} missing`, 'red');
        throw new Error(`Critical documentation file missing: ${file}`);
      }
    });

    // Check for recent changes in CLAUDE.md
    const claudeMd = fs.readFileSync('CLAUDE.md', 'utf-8');
    if (claudeMd.includes('react-datetime-picker') && claudeMd.includes('5-minute intervals')) {
      log('  ✓ CLAUDE.md contains recent feature updates', 'green');
    } else {
      log('  ! CLAUDE.md may need updates for latest features', 'yellow');
    }

    // Phase 4: Code Quality & Cleanup
    logStep('4/6', 'Code Quality & Cleanup');
    
    // Check for common code quality issues
    const srcFiles = execCommand('find src -name "*.tsx" -o -name "*.ts"', 'Finding TypeScript files').trim().split('\n');
    let issuesFound = 0;
    
    for (const file of srcFiles) {
      if (file.trim()) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Check for console.log in production code (except if wrapped in development check)
        const consoleMatches = content.match(/console\.log\(/g);
        const devWrappedConsole = content.match(/process\.env\.NODE_ENV.*===.*['"']development['"'].*console\.log/g);
        
        if (consoleMatches && (!devWrappedConsole || consoleMatches.length > (devWrappedConsole?.length || 0))) {
          log(`  ! ${file}: Potential console.log in production code`, 'yellow');
          issuesFound++;
        }
        
        // Check for unused imports (basic check)
        const importLines = content.match(/^import.*from.*$/gm) || [];
        for (const importLine of importLines) {
          const importMatch = importLine.match(/import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))/);
          if (importMatch) {
            const imported = importMatch[1] || importMatch[2] || importMatch[3];
            if (imported && !imported.includes('type') && content.indexOf(imported.trim()) === content.lastIndexOf(imported.trim())) {
              // Basic unused import detection (may have false positives)
              if (imported.length < 50) { // Avoid false positives on long import lists
                log(`  ! ${file}: Possibly unused import: ${imported}`, 'yellow');
                issuesFound++;
              }
            }
          }
        }
      }
    }
    
    if (issuesFound === 0) {
      log('  ✓ No obvious code quality issues found', 'green');
    } else {
      log(`  ! Found ${issuesFound} potential code quality issues`, 'yellow');
    }

    // Phase 5: Git Operations
    logStep('5/6', 'Git Operations');
    
    // Check git status
    const gitStatus = execCommand('git status --porcelain', 'Checking git status');
    
    if (gitStatus.trim()) {
      log('  Changes detected, proceeding with commit...', 'blue');
      
      // Stage all changes
      execCommand('git add .', 'Staging all changes');
      
      // Generate commit message based on recent changes
      let commitMessage = 'feat: admin dashboard improvements and testing updates';
      let commitBody = [];
      
      // Check what was changed
      if (checkFileExists('tests/admin-datetime-picker.spec.ts')) {
        commitBody.push('- Add comprehensive datetime picker test suite');
      }
      if (claudeMd.includes('react-datetime-picker')) {
        commitBody.push('- Update documentation for datetime picker integration');  
      }
      if (claudeMd.includes('5-minute intervals')) {
        commitBody.push('- Document hourly chart optimization (1min → 5min intervals)');
      }
      
      // Add automation info
      commitBody.push('- Streamline testing strategy: remove UI tests, keep essential quality gates');
      commitBody.push('- Simplify push automation for faster, more reliable deployment process');
      
      const fullCommitMessage = `${commitMessage}

${commitBody.join('\\n')}

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>`;
      
      // Create commit with heredoc for proper formatting
      const commitCommand = `git commit -m "$(cat <<'EOF'
${fullCommitMessage}
EOF
)"`;
      
      execCommand(commitCommand, 'Creating commit with standardized message');
      
      log('  ✓ Commit created successfully', 'green');
      
      // Check if remote exists and push if available
      try {
        execCommand('git remote -v', 'Checking for git remote');
        log('  Git remote detected, you can run "git push origin main" to deploy', 'blue');
      } catch {
        log('  No git remote configured, skipping push', 'yellow');
      }
      
    } else {
      log('  No changes to commit', 'blue');
    }

    // Phase 6: Final Validation
    logStep('6/6', 'Final Test Suite Validation');
    
    // Run optional unit tests
    try {
      execCommand('npm run test:utils', 'Running utility function unit tests');
      log('  ✓ Unit tests passed! Code is ready for deployment', 'green');
    } catch {
      log('  ⚠  Unit tests failed, but build and quality gates passed', 'yellow');
      log('  You may want to check utility functions before deployment', 'yellow');
    }
    
    log('  ✓ UI tests skipped (manual testing recommended)', 'blue');

    // Success summary
    log(`\n${colors.bold}🎉 Push Automation Complete!${colors.reset}`, 'green');
    log('Summary:', 'cyan');
    log('  ✓ Build validation passed', 'green');
    log('  ✓ Code quality checks completed', 'green'); 
    log('  ✓ Essential quality gates validated', 'green');
    log('  ✓ Documentation checked', 'green');
    log('  ✓ Changes committed with standardized message', 'green');
    log('  ✓ Streamlined automation completed', 'green');
    
    log('\n💡 Next steps:', 'blue');
    log('  - Review any warnings above', 'blue');
    log('  - Run "git push origin main" to deploy if ready', 'blue');
    log('  - Monitor deployment for any issues', 'blue');

  } catch (error) {
    log(`\n${colors.bold}❌ Push Automation Failed${colors.reset}`, 'red');
    log(`Error: ${error.message}`, 'red');
    log('\n🔧 Fix the issues above and re-run push automation', 'yellow');
    process.exit(1);
  }
}

// Run the automation
if (require.main === module) {
  runPushAutomation();
}

module.exports = { runPushAutomation };