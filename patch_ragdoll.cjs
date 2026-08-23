const fs = require('fs');

let fileContent = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

const regex = /const shellGroup = new THREE\.Group\(\);[\s\S]*?tracer\.position\.y = -0\.42;[\s\S]*?shellGroup\.add\(tracer\);/g;
const match = regex.exec(fileContent);

if (!match) {
  console.log('Could not find shellGroup setup');
  process.exit(1);
}

const ragdollSetup = `
    const shellGroup = new THREE.Group();
    shellGroup.name = 'projectile-ball';

    // Instead of just a shell, let's create a crash test dummy / ragdoll
    const dummyGroup = new THREE.Group();
    dummyGroup.rotation.y = Math.PI / 2; // Face direction of travel
    
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.9 });
    const jointMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 }); // Blue joints

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.25), skinMat);
    torso.position.y = 0.35;
    dummyGroup.add(torso);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), skinMat);
    head.position.y = 0.85;
    head.name = 'dummy-head';
    
    // Eyes (to see rotation)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04), eyeMat);
    eyeR.position.set(0.08, 0.05, 0.17);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04), eyeMat);
    eyeL.position.set(-0.08, 0.05, 0.17);
    head.add(eyeR);
    head.add(eyeL);
    dummyGroup.add(head);

    // Arms
    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5);
    const larm = new THREE.Group();
    larm.position.set(-0.25, 0.65, 0);
    larm.name = 'dummy-larm';
    const larmMesh = new THREE.Mesh(armGeo, skinMat);
    larmMesh.position.y = -0.25;
    larm.add(larmMesh);
    dummyGroup.add(larm);

    const rarm = new THREE.Group();
    rarm.position.set(0.25, 0.65, 0);
    rarm.name = 'dummy-rarm';
    const rarmMesh = new THREE.Mesh(armGeo, skinMat);
    rarmMesh.position.y = -0.25;
    rarm.add(rarmMesh);
    dummyGroup.add(rarm);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const hipL = new THREE.Group();
    hipL.position.set(-0.12, 0, 0);
    hipL.name = 'dummy-hip-l';
    const lleg = new THREE.Mesh(legGeo, skinMat);
    lleg.position.y = -0.25;
    hipL.add(lleg);
    
    const kneeL = new THREE.Group();
    kneeL.position.y = -0.5;
    kneeL.name = 'dummy-knee-l';
    const lcalf = new THREE.Mesh(legGeo, skinMat);
    lcalf.position.y = -0.25;
    kneeL.add(lcalf);
    hipL.add(kneeL);
    dummyGroup.add(hipL);

    const hipR = new THREE.Group();
    hipR.position.set(0.12, 0, 0);
    hipR.name = 'dummy-hip-r';
    const rleg = new THREE.Mesh(legGeo, skinMat);
    rleg.position.y = -0.25;
    hipR.add(rleg);

    const kneeR = new THREE.Group();
    kneeR.position.y = -0.5;
    kneeR.name = 'dummy-knee-r';
    const rcalf = new THREE.Mesh(legGeo, skinMat);
    rcalf.position.y = -0.25;
    kneeR.add(rcalf);
    hipR.add(kneeR);
    dummyGroup.add(hipR);

    // Center it in shell group
    dummyGroup.position.y = -0.1;
    shellGroup.add(dummyGroup);
`;

fileContent = fileContent.replace(regex, ragdollSetup);

fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', fileContent);
