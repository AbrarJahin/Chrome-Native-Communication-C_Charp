using ExampleApp.Model;
using io.github.ba32107.Chrome.NativeMessaging;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

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

        private async Task<Message> ComputeResponseAsync(Message receivedMessage)
        {
            await Task.Delay(10);
            receivedMessage.XmlText = ReverseString(receivedMessage.XmlText);
            return receivedMessage;
        }

        private async Task CleanUpAsync()
        {
            await Task.Delay(1);
            Application.Current.Shutdown();
        }

        private string ReverseString(string request)
        {
            return new string(request.ToCharArray().Reverse().ToArray());
        }
    }
}
