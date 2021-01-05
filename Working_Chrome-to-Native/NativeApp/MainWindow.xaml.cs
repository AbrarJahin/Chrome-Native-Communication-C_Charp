using ExampleApp.Model;
using io.github.ba32107.Chrome.NativeMessaging;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using System.Windows;
using System.Xml;
using XMLSigner.Library;

namespace ExampleApp
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
            //this.Hide();
            Loaded += WindowLoaded;
        }

        private void WindowLoaded(object sender, RoutedEventArgs e)
        {
            string[] args = Environment.GetCommandLineArgs();
            args = args.Skip(1).ToArray();
            Task.Run(async () => { await StartAsync(); }).GetAwaiter().GetResult();
        }

        private async Task StartAsync()
        {
            var host = new NativeMessagingHost();

            await host.StartListeningAsync(async message =>
            {
                //string request = JsonConvert.DeserializeObject<Message>(message).Text;
                Message receivedMessage = JsonConvert.DeserializeObject<Message>(message);
                Message responseMessage = await ComputeResponseAsync(receivedMessage);
                return JsonConvert.SerializeObject(responseMessage);
            }, CleanUpAsync);
        }

        private async Task CleanUpAsync()
        {
            await Task.Delay(1);
            Application.Current.Shutdown();
        }

        private async Task<Message> ComputeResponseAsync(Message receivedMessage)
        {
            await Task.Delay(10);

            try
            {
                XmlDocument xmlDoc = new XmlDocument();
                //xmlDoc.PreserveWhitespace = false;/////////////////////////////////Should do it in both sign and verify
                xmlDoc.LoadXml(receivedMessage.XmlText);

                X509Certificate2 cert = XmlSign.GetX509Certificate2FromDongle();   //Load Certificate
                XmlDocument signedDoc = XmlSign.GetSignedXMLDocument(xmlDoc, cert);
                if (signedDoc != null)
                {
                    receivedMessage.XmlText = signedDoc.OuterXml;
                    return receivedMessage;
                }
                else
                {
                    receivedMessage.XmlText = "";
                    MessageBox.Show("File Tempered After Last Sign");
                    return receivedMessage;
                }
            }
            catch(Exception ex)
            {
                receivedMessage.XmlText = ex.Message.ToString();
                return receivedMessage;
            }
        }
    }
}
