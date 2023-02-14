const { Console } = require('console');

var exec = require('child_process').exec;



async function runguest(name, ostype, osver, ram, cpu, accel, gpu, border) {
    var command_base = "cd qemu && qemu-system-x86_64";
    var command;
    var hda,cdrom;

    await fsss.readFile('settings.json', {encoding: 'utf8', flag: 'r'}, function(err, data) {
        if(err) console.log(err);
        else {
            var json = JSON.parse(data)
            var editItem = null;
            for (let i = 0; i < json.length; i++) {
                if (json[i].guestname === name) {
                    editItem = i;
                }
            }    
            hda = json[editItem].hdd;
            cdrom = json[editItem].cdrom;

            console.log(name);
            console.log(editItem);

            console.log(hda)
            console.log(cdrom)

            //generate final command

            var smbios = "-smbios type=0,vendor=teslavirtualization,version=2.1 -smbios type=1,manufacturer=teslavirtualization,product=teslavirtualization,version=2.1"
            var portforward = "-net user,hostfwd=tcp::3388-:3389 -net nic"
            var drivers = accel === "whpx" ? "-drive file=../driver.iso,media=cdrom" : "";

            command = command_base + `.exe -name ${name.replace(/\s+/g, '')}  -usbdevice tablet -machine q35 -m ${ram}M -smp ${cpu} -vga ${gpu} -accel ${accel} ${smbios} ${portforward} ${drivers}`;


            console.log(hda)
            console.log(cdrom)

            if (cdrom != "" && hda != "") {
                console.log("CD-ROM and Hard Disk attached, building command with them.")
                command = command + ` -hda ${hda}, -cdrom ${cdrom}`
            } else if (cdrom != "") {
                console.log("CD-ROM attached, building command with it.")
                command = command + ` -cdrom ${cdrom} `
            } else if (hda != "" ) {
                console.log("Hard Disk attached, building command with it")
                command = command + `-hda ${hda} `
            } else {
                console.log("Nothing attached")
                command = command
            }


            console.log(command);
            exec(command, function callback(error, stdout, stderr) {
                console.log(stderr);
                if (stderr.includes("warning") || stderr.includes("WARNING")) {
                    //ignore
                } else {
                    if (stderr.includes("HAX")) {
                        alert("There are two options, you dont have HAXM installed or you have Hyper-V feature enabled. (or you are using AMD cpu)")
                    } else if (stderr.includes("hr=00000000")) {
                        alert("You have to enable Hyper-V feature to use Hyper-V.")
                    } else if (stderr.includes("whpx: injection failed")) {
                        console.log(stderr)
                    } else if (stderr.includes("audio: Failed to create voice")){
                        alert("You should plug in your microphone to prevent from error spam.")
                    } else if(stderr === "" || stderr === undefined) {
                        console.log("empty stderr")
                    } else if (stderr.includes("Image is not in qcow2 format")) {
                        alert("Only qcow2 format is supported for now.")
                    } else if (stderr.includes("Could not open")) {
                        alert("Could not find CD-ROM/HDD on physical disk")
                    }
                }
            });
        }
    });
}

// ${machine.guestname}, ${machine.ostype}, ${machine.osver}, ${machine.ram}, ${machine.cpu}, ${machine.accel}, ${machine.gpu}