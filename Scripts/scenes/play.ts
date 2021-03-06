/**
 * The Scenes module is a namespace to reference all scene objects
 * 
 * @module scenes
 */
module scenes {
    /**
     * The Play class is where the main action occurs for the game
     * 
     * @class Play
     * @param havePointerLock {boolean}
     */
    export class Play extends scenes.Scene {
        private havePointerLock: boolean;
        private element: any;

        private blocker: HTMLElement;
        private instructions: HTMLElement;
        private spotLight: SpotLight;
        private spotLightNext: SpotLight;
        private groundGeometry: CubeGeometry;
        private groundGeometryNext: CubeGeometry;
        private groundPhysicsMaterial: Physijs.Material;
        private groundPhysicsMaterialNext: Physijs.Material;
        private groundMaterial: PhongMaterial;
        private groundMaterialNext: PhongMaterial;
        private ground: Physijs.Mesh;
        private groundNext: Physijs.Mesh;
        private groundTexture: Texture;
        private groundTextureNext: Texture;
        private playerGeometry: CubeGeometry;
        private playerMaterial: Physijs.Material;
        private player: Physijs.Mesh;
        private keyboardControls: objects.KeyboardControls;
        private mouseControls: objects.MouseControls;
        private isGrounded: boolean;
        private coinGeometry: Geometry;
        private coinMaterial: Physijs.Material;
        private coins: Physijs.ConcaveMesh[];
        private coinCount: number;
        private deathPlaneGeometry: CubeGeometry;
        private deathPlaneMaterial: Physijs.Material;
        private deathPlane: Physijs.Mesh;

        private velocity: Vector3;
        private prevTime: number;
        private clock: Clock;

        private stage: createjs.Stage;
        private scoreLabel: createjs.Text;
        private livesLabel: createjs.Text;
        private scoreValue: number;
        private livesValue: number;
        private nextGroundZPosition: number;
        private playersZPosition: number;
        private generatorCounter: number;

        // Enemies
        private enemyGeometry: CubeGeometry;
        private enemyMaterial: Physijs.Material;
        private enemyOne: Physijs.Mesh;
        private enemyTwo: Physijs.Mesh;
        private enemyThree: Physijs.Mesh;

        //Sphere Pickups
        private sphereGeometryPickup: SphereGeometry
        private sphereMaterialPickup: Physijs.Material;
        private spherePickup: Physijs.Mesh;

        /**
         * @constructor
         */
        constructor() {
            super();

            this._initialize();
            this.start();
        }

        // PRIVATE METHODS ++++++++++++++++++++++++++++++++++++++++++

        /**
         * Sets up the initial canvas for the play scene
         * 
         * @method setupCanvas
         * @return void
         */
        private _setupCanvas(): void {
            canvas.setAttribute("width", config.Screen.WIDTH.toString());
            canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
            canvas.style.backgroundColor = "#000000";
        }

        /**
         * The initialize method sets up key objects to be used in the scene
         * 
         * @method _initialize
         * @returns void
         */
        private _initialize(): void {
            //player position
            this.playersZPosition = 0;
            this.generatorCounter = 0;
            this.nextGroundZPosition = 32;


            // Create to HTMLElements
            this.blocker = document.getElementById("blocker");
            this.instructions = document.getElementById("instructions");
            this.blocker.style.display = "block";

            // setup canvas for menu scene
            this._setupCanvas();

            this.coinCount = 10;
            this.prevTime = 0;
            this.stage = new createjs.Stage(canvas);
            this.velocity = new Vector3(0, 0, 0);

            // setup a THREE.JS Clock object
            this.clock = new Clock();

            // Instantiate Game Controls
            this.keyboardControls = new objects.KeyboardControls();
            this.mouseControls = new objects.MouseControls();
        }
        /**
         * This method sets up the scoreboard for the scene
         * 
         * @method setupScoreboard
         * @returns void
         */
        private setupScoreboard(): void {
            // initialize  score and lives values
            this.scoreValue = 0;
            this.livesValue = 1;//Set it as 1 for testing

            // Add Lives Label
            this.livesLabel = new createjs.Text(
                "LIVES: " + this.livesValue,
                "40px Consolas",
                "#ffffff"
            );
            this.livesLabel.x = config.Screen.WIDTH * 0.1;
            this.livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
            this.stage.addChild(this.livesLabel);
            console.log("Added Lives Label to stage");

            // Add Score Label
            this.scoreLabel = new createjs.Text(
                "SCORE: " + this.scoreValue,
                "40px Consolas",
                "#ffffff"
            );
            this.scoreLabel.x = config.Screen.WIDTH * 0.8;
            this.scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
            this.stage.addChild(this.scoreLabel);
            console.log("Added Score Label to stage");
        }

        /**
         * Add a spotLight to the scene
         * 
         * @method addSpotLight
         * @return void
         */
        private addSpotLight(): void {
            // Spot Light
            this.spotLight = new SpotLight(0xffffff);
            this.spotLight.position.set(20, 40, -15);
            this.spotLight.castShadow = true;
            this.spotLight.intensity = 2;
            this.spotLight.lookAt(new Vector3(0, 0, 0));
            this.spotLight.shadowCameraNear = 2;
            this.spotLight.shadowCameraFar = 200;
            this.spotLight.shadowCameraLeft = -5;
            this.spotLight.shadowCameraRight = 5;
            this.spotLight.shadowCameraTop = 5;
            this.spotLight.shadowCameraBottom = -5;
            this.spotLight.shadowMapWidth = 2048;
            this.spotLight.shadowMapHeight = 2048;
            this.spotLight.shadowDarkness = 0.5;
            this.spotLight.name = "Spot Light";
            this.add(this.spotLight);
            console.log("Added spotLight to scene");
        }

        /**
         * Add a spotLight for the next plane added
         * 
         * @method addNextSpotLight
         * @return void
         */
        private addNextSpotLight(): void {
            this.spotLightNext = new SpotLight(0xffffff);
            this.spotLightNext.position.set(0, 50, (64 + this.nextGroundZPosition));
            this.spotLightNext.castShadow = true;
            this.spotLightNext.intensity = 3;
            this.spotLightNext.lookAt(new Vector3(0, 0, this.nextGroundZPosition + 10));
            this.spotLightNext.shadowCameraNear = 2;
            this.spotLightNext.shadowCameraFar = 200;
            this.spotLightNext.shadowCameraLeft = -5;
            this.spotLightNext.shadowCameraRight = 5;
            this.spotLightNext.shadowCameraTop = 5;
            this.spotLightNext.shadowCameraBottom = -5;
            this.spotLightNext.shadowMapWidth = 2048;
            this.spotLightNext.shadowMapHeight = 2048;
            this.spotLightNext.shadowDarkness = 0.5;
            this.spotLightNext.name = "Spot Light Next";

            console.log("SpotlightNext looking at" + this.nextGroundZPosition);
            this.add(this.spotLightNext);
        }
        /**
         * Add a ground plane to the scene
         * 
         * @method addGround
         * @return void
         */
        private addGround(): void {
            this.groundTexture = new THREE.TextureLoader().load('../../Assets/images/GravelCobble.jpg');
            this.groundTexture.wrapS = THREE.RepeatWrapping;
            this.groundTexture.wrapT = THREE.RepeatWrapping;
            this.groundTexture.repeat.set(1, 1);

            this.groundMaterial = new PhongMaterial();
            this.groundMaterial.map = this.groundTexture;

            this.groundGeometry = new BoxGeometry(32, 1, 32);
            this.groundPhysicsMaterial = Physijs.createMaterial(this.groundMaterial, 0, 0);
            this.ground = new Physijs.ConvexMesh(this.groundGeometry, this.groundPhysicsMaterial, 0);
            this.ground.receiveShadow = true;
            this.ground.name = "Ground";
            this.add(this.ground);
            console.log("Added Burnt Ground to scene");
        }
        /**
         * 
         */
        private addNewGround(): void {
            this.enemyGeometry = new BoxGeometry(4, 4, 4);
            this.enemyMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xff0000 }), 0.4, 0);

            if (this.generatorCounter % 2 == 0) {

                scene.remove(this.groundNext);
                scene.remove(this.spotLightNext);
                scene.remove(this.spherePickup);

                console.log("Created Original Ground");
                // Placing new ground texture
                this.addNextGroundTexture();
                //Placing new Spotlight
                this.addNextSpotLight();



                this.addSpherePickup();
                this.addNextEnemies();

            } else if (this.generatorCounter % 2 != 0) {

                scene.remove(this.ground);
                scene.remove(this.spotLight);
                scene.remove(this.spherePickup);

                // Placing new ground texture
                this.addNextGroundTexture();

                //Placing new Spotlight
                this.addNextSpotLight();


                this.addSpherePickup();

                this.addNextEnemies();

            }
        }

        /**
         * 
         */
        private addNextGroundTexture(): void {
            // Placing new ground texture
            this.groundTextureNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            this.groundTextureNext.wrapS = THREE.RepeatWrapping;
            this.groundTextureNext.wrapT = THREE.RepeatWrapping;
            this.groundTextureNext.repeat.set(1, 1);

            this.groundMaterialNext = new PhongMaterial();
            this.groundMaterialNext.map = this.groundTextureNext;
            this.groundMaterialNext.bumpMap = this.groundTextureNext;
            this.groundMaterialNext.bumpScale = 0.2;

            this.groundGeometryNext = new BoxGeometry(32, 1, 32);
            this.groundPhysicsMaterialNext = Physijs.createMaterial(this.groundMaterialNext, 0, 0);
            this.groundNext = new Physijs.ConvexMesh(this.groundGeometryNext, this.groundPhysicsMaterialNext, 0);
            this.groundNext.position.set(0, 0, this.nextGroundZPosition);
            this.groundNext.receiveShadow = true;
            this.groundNext.name = "Ground";
            this.add(this.groundNext);
        }


        /**
         * Add a new ground plane to the scene
         * 
         * @method addNextGround
         * @return void
         */
        private addNextGround(): void {
            this.groundTextureNext = new THREE.TextureLoader().load("../../Assets/images/road.jpg");
            this.groundTextureNext.wrapS = THREE.RepeatWrapping;
            this.groundTextureNext.wrapT = THREE.RepeatWrapping;
            this.groundTextureNext.repeat.set(1, 1);
            this.groundMaterialNext = new PhongMaterial();
            this.groundMaterialNext.map = this.groundTextureNext;
            this.groundMaterialNext.bumpMap = this.groundTextureNext;
            this.groundMaterialNext.bumpScale = 0.2;
            this.groundGeometryNext = new BoxGeometry(32, 1, 32);
            this.groundPhysicsMaterialNext = Physijs.createMaterial(this.groundMaterialNext, 0, 0);
            this.groundNext = new Physijs.ConvexMesh(this.groundGeometryNext, this.groundPhysicsMaterialNext, 0);
            this.groundNext.position.set(0, 0, this.nextGroundZPosition);
            this.groundNext.receiveShadow = true;
            this.groundNext.name = "Ground";
            this.add(this.groundNext);
        }
        /**
         * Adds the player controller to the scene
         * 
         * @method addPlayer
         * @return void
         */
        private addPlayer(): void {
            // Player Object
            this.playerGeometry = new BoxGeometry(3, 2, 4);
            this.playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);

            this.player = new Physijs.BoxMesh(this.playerGeometry, this.playerMaterial, 1);
            this.player.position.set(0, 3, 10);
            this.player.rotateY(180);
            this.player.receiveShadow = true;
            this.player.castShadow = true;
            this.player.name = "Player";
            this.add(this.player);
            console.log("Added Player to Scene");
        }

        /**
         * Add the death plane to the scene
         * 
         * @method addDeathPlane
         * @return void
         */

        private addDeathPlane(): void {
            this.deathPlaneGeometry = new BoxGeometry(100, 1, 100);
            this.deathPlaneMaterial = Physijs.createMaterial(new MeshBasicMaterial({ color: 0x000000 }), 0.4, 0.6);

            this.deathPlane = new Physijs.BoxMesh(this.deathPlaneGeometry, this.deathPlaneMaterial, 0);
            this.deathPlane.position.set(0, -10, 0);
            this.deathPlane.name = "DeathPlane";
            this.add(this.deathPlane);
        }

        /**
         * This method adds a coin to the scene
         * 
         * @method addCoinMesh
         * @return void
         */
        private addCoinMesh(): void {
            var self = this;

            this.coins = new Array<Physijs.ConvexMesh>(); // Instantiate a convex mesh array

            var coinLoader = new THREE.JSONLoader().load("../../Assets/imported/coin.json", function(geometry: THREE.Geometry) {
                var phongMaterial = new PhongMaterial({ color: 0xE7AB32 });
                phongMaterial.emissive = new THREE.Color(0xE7AB32);

                var coinMaterial = Physijs.createMaterial((phongMaterial), 0.4, 0.6);

                for (var count: number = 0; count < self.coinCount; count++) {
                    self.coins[count] = new Physijs.ConvexMesh(geometry, coinMaterial);
                    self.coins[count].receiveShadow = true;
                    self.coins[count].castShadow = true;
                    self.coins[count].name = "Coin";
                    self.setCoinPosition(self.coins[count]);
                    console.log("Added Coin Mesh to Scene, at position: " + self.coins[count].position);
                }
            });


        }
        /**
         * This method adds a spheres to the scene
         * 
         * @method addSpherePickup
         * @return void
         */
        private addSpherePickup(): void {
            this.sphereGeometryPickup = new SphereGeometry(1, 32, 32);
            this.sphereMaterialPickup = Physijs.createMaterial(new LambertMaterial({ color: 0xffaa11 }), 0.4, 0);
            this.spherePickup = new Physijs.SphereMesh(this.sphereGeometryPickup, this.sphereMaterialPickup, 1);
            this.spherePickup.position.set(0, 1000, 0);
            this.spherePickup.receiveShadow = true;
            this.spherePickup.castShadow = true;
            this.spherePickup.name = "SpherePickup";
            this.add(this.spherePickup);
        }
        /**
         * This method randomly sets the coin object's position
         * 
         * @method setCoinPosition
         * @return void
         */
        private setCoinPosition(coin: Physijs.ConvexMesh): void {
            var randomPointX: number = Math.floor(Math.random() * 20) - 10;
            var randomPointZ: number = Math.floor(Math.random() * 20) - 10;
            coin.position.set(randomPointX, 10, randomPointZ);
            this.add(coin);
        }


        /**
         * This method creates new enemies on the new plane and adds them to the scene
         * 
         * @methodcreateNewNextEnemies
         * @return void
         */
        private addNextEnemies(): void {
            var max = this.nextGroundZPosition;
            var min = this.nextGroundZPosition - 15;

            this.enemyOne = new Physijs.BoxMesh(this.enemyGeometry, this.enemyMaterial, 1);
            this.enemyOne.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            this.enemyOne.receiveShadow = true;
            this.enemyOne.castShadow = true;
            this.enemyOne.name = "Enemy One";
            this.add(this.enemyOne);

            this.enemyTwo = new Physijs.BoxMesh(this.enemyGeometry, this.enemyMaterial, 1);
            this.enemyTwo.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            this.enemyTwo.receiveShadow = true;
            this.enemyTwo.castShadow = true;
            this.enemyTwo.name = "Enemy Two";
            this.add(this.enemyTwo);

            this.enemyThree = new Physijs.BoxMesh(this.enemyGeometry, this.enemyMaterial, 1);
            this.enemyThree.position.set(Math.floor(Math.random() * (15 - -15 + 1)) + -15, 50, Math.floor(Math.random() * (max - min + 1)) + min);
            this.enemyThree.receiveShadow = true;
            this.enemyThree.castShadow = true;
            this.enemyThree.name = "Enemy Three";
            this.add(this.enemyThree);
        }

        /**
         * Event Handler method for any pointerLockChange events
         * 
         * @method pointerLockChange
         * @return void
         */
        pointerLockChange(event): void {
            if (document.pointerLockElement === this.element) {
                // enable our mouse and keyboard controls
                this.keyboardControls.enabled = true;
                this.mouseControls.enabled = true;
                this.blocker.style.display = 'none';
            } else {
                if (this.livesValue <= 0) {
                    this.blocker.style.display = 'none';
                    document.removeEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
                    document.removeEventListener('mozpointerlockchange', this.pointerLockChange.bind(this), false);
                    document.removeEventListener('webkitpointerlockchange', this.pointerLockChange.bind(this), false);
                    document.removeEventListener('pointerlockerror', this.pointerLockError.bind(this), false);
                    document.removeEventListener('mozpointerlockerror', this.pointerLockError.bind(this), false);
                    document.removeEventListener('webkitpointerlockerror', this.pointerLockError.bind(this), false);
                } else {
                    this.blocker.style.display = '-webkit-box';
                    this.blocker.style.display = '-moz-box';
                    this.blocker.style.display = 'box';
                    this.instructions.style.display = '';
                }
                // disable our mouse and keyboard controls
                this.keyboardControls.enabled = false;
                this.mouseControls.enabled = false;
                console.log("PointerLock disabled");
            }
        }

        /**
         * Event handler for PointerLockError
         * 
         * @method pointerLockError
         * @return void
         */
        private pointerLockError(event): void {
            this.instructions.style.display = '';
            console.log("PointerLock Error Detected!!");
        }

        // Check Controls Function

        /**
         * This method updates the player's position based on user input
         * 
         * @method checkControls
         * @return void
         */
        private checkControls(): void {
            if (this.keyboardControls.enabled) {
                this.velocity = new Vector3();

                var time: number = performance.now();
                var delta: number = (time - this.prevTime) / 1000;

                if (this.isGrounded) {
                    var direction = new Vector3(0, 0, 0);
                    if (this.keyboardControls.moveForward) {
                        this.velocity.z -= 400.0 * delta;

                    }
                    if (this.keyboardControls.moveLeft) {
                        this.velocity.x -= 400.0 * delta;
                    }
                    if (this.keyboardControls.moveBackward) {
                        this.velocity.z += 400.0 * delta;
                    }
                    if (this.keyboardControls.moveRight) {
                        this.velocity.x += 400.0 * delta;
                    }

                    if (this.keyboardControls.jump) {
                        this.velocity.y += 4000.0 * delta;
                        if (this.player.position.y > 4) {
                            this.isGrounded = false;
                            createjs.Sound.play("jump");
                        }

                    }
                    //*/
                    this.player.setDamping(0.7, 0.1);
                    // Changing player's rotation
                    this.player.setAngularVelocity(new Vector3(0, this.mouseControls.yaw, 0));
                    direction.addVectors(direction, this.velocity);
                    direction.applyQuaternion(this.player.quaternion);
                    if (Math.abs(this.player.getLinearVelocity().x) < 20 && Math.abs(this.player.getLinearVelocity().y) < 10) {
                        this.player.applyCentralForce(direction);
                    }

                    //this.cameraLook();

                } // isGrounded ends

                //reset Pitch and Yaw
                this.mouseControls.pitch = 0;
                this.mouseControls.yaw = 0;

                this.prevTime = time;
            } // Controls Enabled ends
            else {
                this.player.setAngularVelocity(new Vector3(0, 0, 0));
            }
        }

        private _unpauseSimulation(): void {
            scene.onSimulationResume();
            console.log("resume simulation");
        }
        /**
         * Camera Look function
         * 
         * @method cameraLook
         * @return void
         */
        private cameraLook(): void {
            var zenith: number = THREE.Math.degToRad(90);
            var nadir: number = THREE.Math.degToRad(-90);

            var cameraPitch: number = camera.rotation.x + this.mouseControls.pitch;

            // Constrain the Camera Pitch
            camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
        }

        private playerPositionCheck(): void {
            this.playersZPosition = this.player.position.z;
            if (this.playersZPosition > this.nextGroundZPosition) {
                this.nextGroundZPosition += 32;
                console.log("Player z: " + this.player.position.z + "\n");
                this.generatorCounter++;
                console.log(this.generatorCounter);
                this.addNextGround();
            }
        }

        // PUBLIC METHODS +++++++++++++++++++++++++++++++++++++++++++

        /**
         * The start method is the main method for the scene class
         * 
         * @method start
         * @return void
         */
        public start(): void {
            // Set Up Scoreboard
            this.setupScoreboard();

            //check to see if pointerlock is supported
            this.havePointerLock = 'pointerLockElement' in document ||
                'mozPointerLockElement' in document ||
                'webkitPointerLockElement' in document;



            // Check to see if we have pointerLock
            if (this.havePointerLock) {
                this.element = document.body;

                this.instructions.addEventListener('click', () => {

                    // Ask the user for pointer lock
                    console.log("Requesting PointerLock");

                    this.element.requestPointerLock = this.element.requestPointerLock ||
                        this.element.mozRequestPointerLock ||
                        this.element.webkitRequestPointerLock;

                    this.element.requestPointerLock();
                });

                document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
                document.addEventListener('mozpointerlockchange', this.pointerLockChange.bind(this), false);
                document.addEventListener('webkitpointerlockchange', this.pointerLockChange.bind(this), false);
                document.addEventListener('pointerlockerror', this.pointerLockError.bind(this), false);
                document.addEventListener('mozpointerlockerror', this.pointerLockError.bind(this), false);
                document.addEventListener('webkitpointerlockerror', this.pointerLockError.bind(this), false);
            }

            // Scene changes for Physijs
            this.name = "Main";
            this.fog = new THREE.Fog(0xffffff, 0, 750);
            this.setGravity(new THREE.Vector3(0, -10, 0));

            // start simulation
            /*
            this.addEventListener('update', this._simulateScene);
            console.log("Start Simulation"); */

            // Add Spot Light to the scene
            this.addSpotLight();
            this.addNextSpotLight();

            // Ground Object
            //this.addGround();
            this.addNextGroundTexture();
            this.addSpherePickup();

            this.addNewGround();
            this.addNextEnemies();


            // Add player controller
            //this.addPlayer();

            // Add custom coin imported from Blender
            //this.addCoinMesh();

            // Add death plane to the scene
            this.addDeathPlane();

            // Collision Check
            this.player.addEventListener('collision', function(eventObject) {
                if (eventObject.name === "Ground") {
                    this.isGrounded = true;
                    createjs.Sound.play("land");
                }
                if (eventObject.name === "Sphere") {
                    console.log("player hit the sphere");
                    this.remove(this.sphere);
                }
                if (eventObject.name === "SpherePickup") {
                    createjs.Sound.play("coin");
                    this.remove(eventObject);
                    this.setCoinPosition(eventObject);
                    this.scoreValue += 3;
                    this.scoreLabel.text = "SCORE: " + this.scoreValue;
                }
                if (eventObject.name === "Enemy One") {
                    this.remove(this.enemyOne);
                    console.log("Death");
                    this.livesValue--;
                }
                if (eventObject.name === "Enemy Two") {
                    this.remove(this.enemyTwo);
                    console.log("Death");
                    this.livesValue--;
                }
                if (eventObject.name === "Enemy Three") {
                    this.remove(this.enemyThree);
                    console.log("Death");
                    this.livesValue--;
                }
                if (eventObject.name === "DeathPlane") {
                    createjs.Sound.play("hit");
                    this.livesValue--;
                    if (this.livesValue <= 0) {
                        // Exit Pointer Lock
                        document.exitPointerLock();
                        this.children = []; // an attempt to clean up
                        this._isGamePaused = true;

                        // Play the Game Over Scene
                        currentScene = config.Scene.OVER;
                        changeScene();
                    } else {
                        // otherwise reset my player and update Lives
                        this.livesLabel.text = "LIVES: " + this.livesValue;
                        this.remove(this.player);
                        this.player.position.set(0, 4, 15);
                        this.add(this.player);
                    }
                }
                if (this.livesValue <= 0) {
                    alert("You are Dead!");
                }
            }.bind(this));

            // create parent-child relationship with camera and player
            this.player.add(camera);
            camera.position.set(0, 4, 15);
            this.simulate();
        }

        /**
         * @method update
         * @returns void
         */
        public update(): void {
            this.coins.forEach(coin => {
                coin.setAngularFactor(new Vector3(0, 0, 0));
                coin.setAngularVelocity(new Vector3(0, 1, 0));
            });
            this.checkControls();
            this.stage.update();

            if (!this.keyboardControls.paused) {
                this.simulate();
            }

        }

        /**
         * Responds to screen resizes
         * 
         * @method resize
         * @return void
         */
        public resize(): void {
            canvas.style.width = "100%";
            this.livesLabel.x = config.Screen.WIDTH * 0.1;
            this.livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
            this.scoreLabel.x = config.Screen.WIDTH * 0.8;
            this.scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
            this.stage.update();
        }
    }
}