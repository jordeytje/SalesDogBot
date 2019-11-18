const Discord = require('discord.js');
const client = new Discord.Client();
const password = '';

const puppeteer = require('puppeteer');

// HumbleBundle scraper 
let scrapeHumbleBundle = async () =>
{
    let pageUrl = 'https://www.humblebundle.com/';

    let browser = await puppeteer.launch(); //{ headless: false } opent een browser
    let page = await browser.newPage();

    await page.goto(pageUrl, { waitUntil: 'networkidle2' });

    let data = await page.evaluate(() =>
    {
        const bundlesAmountElem = document.querySelector('.navbar-item .dropdown-button button span span').innerHTML;
        let bundlesAmount = bundlesAmountElem.substr(0, 3).trim();

        // get bundle data from all bundles
        let bundleTitleArray = [];
        let bundleNameArray = [];
        let bundlePriceArray = [];
        let bundleTimerArray = [];
        let bundleLinkArray = [];

        for (let i = 1; i <= bundlesAmount; i++)
        {
            bundleTitleArray.push(document.querySelector(`.bundle-dropdown-content a:nth-of-type(${i}) .more-details .title`).innerHTML);
            bundleNameArray.push(document.querySelector(`.bundle-dropdown-content a:nth-of-type(${i}) .image-container .tile-info .name`).innerHTML);
            bundlePriceArray.push(document.querySelector(`.bundle-dropdown-content a:nth-of-type(${i}) .more-details .marketing-blurb`).innerHTML);
            bundleTimerArray.push(document.querySelector(`.bundle-dropdown-content a:nth-of-type(${i}) .image-container .tile-info .js-countdown-view .timer .js-simple-countdown-timer span`).innerHTML)
            bundleLinkArray.push(document.querySelector(`.bundle-dropdown-content a:nth-of-type(${i})`).getAttribute('href'))
        }

        return {
            bundlesAmount,
            bundleTitleArray,
            bundleNameArray,
            bundlePriceArray,
            bundleTimerArray,
            bundleLinkArray
        }
    });

    // console.log(data);

    await browser.close();

    return data;
};

// stop bot 
let stopBot = async () =>
{
    await client.destroy();
}

// when ready 
client.on('ready', () =>
{
    console.log("SalesDOG connected as " + client.user.tag);

    defaultActivity();

    // client.guilds.forEach((guild) =>
    // {
    //     // console.log(guild.name);

    //     // guild.channels.forEach((channel) =>
    //     // {
    //     //     console.log(` - ${channel.name} ${channel.type} ${channel.id}`);
    //     // })

    //     // let generalChannel = client.channels.get('642382276717707278');
    //     // const attachment = new Discord.Attachment("https://i.cbc.ca/1.5256404.1566499707!/fileImage/httpImage/image.jpg_gen/derivatives/16x9_780/cat-behaviour.jpg");
    //     // generalChannel.send(attachment);

    // })
})

// bot reageert op elk bericht
client.on('message', (receivedMessage) =>
{
    // check if message is not from SalesDog 
    if (receivedMessage.author == client.user)
    {
        return
    }

    // check if message is for bot 
    if (receivedMessage.content.startsWith('?sd'))
    {
        processCommand(receivedMessage);
    }
})

// set default SalesDog bot activity 
function defaultActivity()
{
    client.user.setActivity('?sd help', { type: 'Listening' });
}

// convert user message so the bot can use it 
function processCommand(receivedMessage)
{
    let fullCommand = receivedMessage.content.substr(3);
    let splitCommand = fullCommand.split(' ');
    let primaryCommand = splitCommand[1];
    let arguments = splitCommand.slice(2);

    console.log("full " + fullCommand);
    console.log("split " + splitCommand);
    console.log("primary " + primaryCommand);
    console.log(arguments);

    // commands switcher 
    switch (primaryCommand)
    {
        case "help":
            helpCommand(receivedMessage);
            break;
        case "command":
            helpCommand(receivedMessage);
            break;
        case "steam":
            steamCommand(receivedMessage);
            break;
        case "pepper":
            pepperCommand(arguments, receivedMessage);
            break;
        case "humblebundle":
            humblebundleCommand(arguments, receivedMessage);
            break;
        case "hb":
            humblebundleCommand(arguments, receivedMessage);
            break;
        case "stop":
            stopCommand(receivedMessage);
            break;
        default:
            helpCommand(receivedMessage);
    }
}

// commands 
// help en commands
function helpCommand(receivedMessage)
{
    receivedMessage.channel.send(
        "Sales Dog Help, basically a command list at the moment \nHere is a list of SalesDog commands: \n\n`?sd help` Sales Dog Help, basically a command list at the moment \n`?sd commands` Sales Dog Commands, this list... \n`?sd steam` Current Steam Sales (link to page) \n`?sd humblebundle` or `?sd hb` All Current Humble Bundle Bundles \n`?sd humblebundle monthly` or `?sd hb monthly` or `?sd hb m` Current Humble Bundle Monthly Sale \n`?sd stop` To stop the bot (Use this when hell breaks loose). \n`?sd pepper` Current Pepper Sales (link to page) \n`?sd pepper steam` Current Steam Sales on Pepper (link to page)"
    )
}

// steam 
function steamCommand(receivedMessage)
{
    receivedMessage.channel.send("*There are like 300 pages..* to prevent myself from getting a stroke, here is the link. then **you** can check it **yourself**:\nhttps://store.steampowered.com/search/?specials=1 " + receivedMessage.author.toString())
}

// pepper 
function pepperCommand(arguments, receivedMessage)
{
    if (arguments.length == 0)
    {
        receivedMessage.channel.send("*There are like 450 pages..* to prevent myself from getting a stroke, here is the link. then **you** can check it **yourself**:\nhttps://nl.pepper.com/groep/videogames " + receivedMessage.author.toString())
    }

    if (arguments == 'steam')
    {
        receivedMessage.channel.send("*There are like 60 pages..* to prevent myself from getting a stroke, here is the link. then **you** can check it **yourself**:\nhttps://nl.pepper.com/groep/steam " + receivedMessage.author.toString())
    }
}

// humblebundle 
function humblebundleCommand(arguments, receivedMessage)
{
    // default 
    if (arguments.length == 0)
    {
        client.user.setActivity('Humble Bundle Deals', { type: 'Watching' });

        scrapeHumbleBundle().then((value) =>
        {
            receivedMessage.channel.send('I found a total of **' + value.bundlesAmount + '** Bundles.\nIf you want to see **all the bundles** type in `?sd humblebundle all` or `?sd hb all`\n\nIf you only want to see the **Monthly bundle** for this month. then type in `?sd humblebundle monthly` or `?sd hb monthly` or `?sd hb m`' + receivedMessage.author.toString());

            defaultActivity();
        })

        receivedMessage.channel.send('I\'m searching for you.. give me a couple seconds... ' + receivedMessage.author.toString());
    }

    // monthly 
    if (arguments == "monthly" || arguments == "m")
    {
        receivedMessage.channel.send('Current Humble Bundle Monthly Bundle ' + receivedMessage.author.toString());
        receivedMessage.channel.send("https://www.humblebundle.com/monthly");
    }

    // all 
    if (arguments == "all")
    {
        client.user.setActivity('Humble Bundle Deals', { type: 'Watching' });

        scrapeHumbleBundle().then((value) =>
        {
            console.log(value);

            const bundlesAmountMinusOne = parseInt(value.bundlesAmount) - 1;

            for (let i = 0; i < value.bundlesAmount; i++)
            {
                receivedMessage.channel.send(`\n**Bundle Number** ${i + 1} \n**Bundle Title/Price:** ${value.bundleTitleArray[i]} \n**Bundle Name:** ${value.bundleNameArray[i]} \n**Bundle Price/Title:** ${value.bundlePriceArray[i]} \n**Bundle Valid for:** ${value.bundleTimerArray[i]} \n**Link:** https://www.humblebundle.com${value.bundleLinkArray[i]} \n**This bundle link attachment underneath.**`);

                if (i < bundlesAmountMinusOne)
                {
                    client.user.setActivity('Loading Humble Bundle Deals', { type: 'Watching' });
                } else
                {
                    defaultActivity();
                }
            }

            receivedMessage.channel.send(`This should be all **${value.bundlesAmount}** of them. ` + receivedMessage.author.toString());
        })

        receivedMessage.channel.send('I\'m searching for you.. give me a couple seconds... ' + receivedMessage.author.toString());
        receivedMessage.channel.send('When I find something I will let you know, **it can take some time before they\'re all loaded** ' + receivedMessage.author.toString());

    }
}

// stop bot 
function stopCommand(receivedMessage)
{
    receivedMessage.channel.send("Stopping Sales Dog Bot, off to retirement.");
    stopBot();
}

// login bot 
client.login(password);