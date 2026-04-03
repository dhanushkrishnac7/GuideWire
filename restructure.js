const fs = require('fs');
const path = require('path');

const root = 'C:\\Users\\user\\Downloads\\phase-1 guidewire\\GuideWire';

// Delete web folder
const webPath = path.join(root, 'web');
if (fs.existsSync(webPath)) {
  fs.rmSync(webPath, { recursive: true, force: true });
  console.log('Deleted web/');
} else {
  console.log('web/ not found, skipping');
}

// Rename gig-worker-insurance to mobile
const oldPath = path.join(root, 'gig-worker-insurance');
const newPath = path.join(root, 'mobile');
if (fs.existsSync(oldPath)) {
  fs.renameSync(oldPath, newPath);
  console.log('Renamed gig-worker-insurance -> mobile');
} else {
  console.log('gig-worker-insurance not found');
}
