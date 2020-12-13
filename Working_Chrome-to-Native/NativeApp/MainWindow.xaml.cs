using ExampleApp.Model;
using io.github.ba32107.Chrome.NativeMessaging;
using Newtonsoft.Json;
using System;
using System.Linq;
using System.Text;
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
                string request = JsonConvert.DeserializeObject<Message>(message).Text;
                string response = await ComputeResponseAsync(request);
                await Dispatcher.BeginInvoke(new Action(() => TextMessage.Content = request));
                return JsonConvert.SerializeObject(new Message
                {
                    Text = response
                });
            }, CleanUpAsync);
        }

        private async Task CleanUpAsync()
        {
            await Task.Delay(1000);
            Application.Current.Shutdown();
        }

        private async Task<string> ComputeResponseAsync(string request)
        {
            await Task.Delay(1000);
            return ReverseString(request);
        }

        private void Start()
        {
            var host = new NativeMessagingHost();

            host.StartListening(message =>
            {
                var request = JsonConvert.DeserializeObject<Message>(message).Text;
                string response = ReverseString(request);
                return JsonConvert.SerializeObject(new Message
                {
                    Text = response
                });
            }, () =>
            {
                Application.Current.Shutdown();
            });
        }

        private string ReverseString(string request)
        {
            return new string(request.ToCharArray().Reverse().ToArray());
        }

        private void PrintUsage()
        {
            var sb = new StringBuilder();

            sb.AppendLine("*** Chrome.NativeMessaging Example Application ***");
            sb.AppendLine();
            sb.AppendLine("Without arguments: starts listening for Chrome extension messages.");
            sb.AppendLine("Options:");
            sb.AppendLine("--install: installs the native messaging host. Needs Chrome extension ID as second argument.");
            sb.AppendLine("--uninstall: removes the native messaging host. Needs Chrome extension ID as second argument.");

            Console.Write(sb.ToString());
        }
    }
}
