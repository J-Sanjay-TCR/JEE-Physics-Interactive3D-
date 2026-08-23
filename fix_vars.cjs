const fs = require('fs');

let fileContent = fs.readFileSync('src/components/canvas/SimulationRenderer.ts', 'utf8');

// Replace the injected block entirely. We know it starts at "// Instead of just a shell" and ends at "shellGroup.add(dummyGroup);"
const regex = /\/\/ Instead of just a shell[\s\S]*?shellGroup\.add\(dummyGroup\);/g;
const newDummy = `
    // Dummy inside shell
    const dmyGroup = new THREE.Group();
    dmyGroup.rotation.y = Math.PI / 2; 
    
    const dmySkin = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.9 });

    const dmyTorso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.25), dmySkin);
    dmyTorso.position.y = 0.35;
    dmyGroup.add(dmyTorso);

    const dmyHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), dmySkin);
    dmyHead.position.y = 0.85;
    dmyHead.name = 'dummy-head';
    
    const dmyEyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const dmyEyeR = new THREE.Mesh(new THREE.SphereGeometry(0.04), dmyEyeMat);
    dmyEyeR.position.set(0.08, 0.05, 0.17);
    const dmyEyeL = new THREE.Mesh(new THREE.SphereGeometry(0.04), dmyEyeMat);
    dmyEyeL.position.set(-0.08, 0.05, 0.17);
    dmyHead.add(dmyEyeR);
    dmyHead.add(dmyEyeL);
    dmyGroup.add(dmyHead);

    const dmyArmGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.5);
    const dmyLarm = new THREE.Group();
    dmyLarm.position.set(-0.25, 0.65, 0);
    dmyLarm.name = 'dummy-larm';
    const dmyLarmMesh = new THREE.Mesh(dmyArmGeo, dmySkin);
    dmyLarmMesh.position.y = -0.25;
    dmyLarm.add(dmyLarmMesh);
    dmyGroup.add(dmyLarm);

    const dmyRarm = new THREE.Group();
    dmyRarm.position.set(0.25, 0.65, 0);
    dmyRarm.name = 'dummy-rarm';
    const dmyRarmMesh = new THREE.Mesh(dmyArmGeo, dmySkin);
    dmyRarmMesh.position.y = -0.25;
    dmyRarm.add(dmyRarmMesh);
    dmyGroup.add(dmyRarm);

    const dmyLegGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5);
    const dmyHipL = new THREE.Group();
    dmyHipL.position.set(-0.12, 0, 0);
    dmyHipL.name = 'dummy-hip-l';
    const dmyLleg = new THREE.Mesh(dmyLegGeo, dmySkin);
    dmyLleg.position.y = -0.25;
    dmyHipL.add(dmyLleg);
    
    const dmyKneeL = new THREE.Group();
    dmyKneeL.position.y = -0.5;
    dmyKneeL.name = 'dummy-knee-l';
    const dmyLcalf = new THREE.Mesh(dmyLegGeo, dmySkin);
    dmyLcalf.position.y = -0.25;
    dmyKneeL.add(dmyLcalf);
    dmyHipL.add(dmyKneeL);
    dmyGroup.add(dmyHipL);

    const dmyHipR = new THREE.Group();
    dmyHipR.position.set(0.12, 0, 0);
    dmyHipR.name = 'dummy-hip-r';
    const dmyRleg = new THREE.Mesh(dmyLegGeo, dmySkin);
    dmyRleg.position.y = -0.25;
    dmyHipR.add(dmyRleg);

    const dmyKneeR = new THREE.Group();
    dmyKneeR.position.y = -0.5;
    dmyKneeR.name = 'dummy-knee-r';
    const dmyRcalf = new THREE.Mesh(dmyLegGeo, dmySkin);
    dmyRcalf.position.y = -0.25;
    dmyKneeR.add(dmyRcalf);
    dmyHipR.add(dmyKneeR);
    dmyGroup.add(dmyHipR);

    dmyGroup.position.y = -0.1;
    shellGroup.add(dmyGroup);
`;

fileContent = fileContent.replace(regex, newDummy);

fs.writeFileSync('src/components/canvas/SimulationRenderer.ts', fileContent);
