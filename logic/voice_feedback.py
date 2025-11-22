import pyttsx3
import threading
import time
import queue

class VoiceFeedback:
    def __init__(self):
        self.engine = None
        self.queue = queue.Queue()
        self.last_spoken_time = 0
        self.last_message = ""
        self.min_interval = 2.0  # Reduced from 3.0 to allow faster corrections
        self.repeat_interval = 5.0 # Reduced from 10.0 to allow repeating corrections sooner
        self.is_running = True
        
        # Start the worker thread
        self.thread = threading.Thread(target=self._worker, daemon=True)
        self.thread.start()

    def _init_engine(self):
        """Initialize the engine in the worker thread"""
        if self.engine is None:
            try:
                self.engine = pyttsx3.init()
                self.engine.setProperty('rate', 150)  # Speed of speech
                self.engine.setProperty('volume', 0.9) # Volume (0.0 to 1.0)
            except Exception as e:
                print(f"Failed to initialize TTS engine: {e}")

    def _worker(self):
        """Worker thread to process the speech queue"""
        self._init_engine()
        
        while self.is_running:
            try:
                # Get message from queue with timeout to allow checking is_running
                message = self.queue.get(timeout=0.5)
                
                if self.engine:
                    # Re-initialize loop if needed (sometimes required on Windows)
                    self.engine.say(message)
                    self.engine.runAndWait()
                    # Small sleep to ensure audio device is released
                    time.sleep(0.1)
                
                self.queue.task_done()
            except queue.Empty:
                # Pump the event loop periodically to keep the engine alive
                if self.engine:
                    try:
                        self.engine.iterate()
                    except:
                        pass
                continue
            except Exception as e:
                print(f"Error in TTS worker: {e}")
                # Try to re-init engine on error
                self.engine = None
                self._init_engine()

    def speak(self, text):
        """
        Add text to the speech queue if it passes the frequency checks.
        """
        if not text or text.strip() == "":
            return

        current_time = time.time()
        
        # Check for repetition
        if text == self.last_message:
            if current_time - self.last_spoken_time < self.repeat_interval:
                return # Skip repetitive message
        else:
            # Check for frequency of different messages
            if current_time - self.last_spoken_time < self.min_interval:
                return # Skip if too frequent

        # If we get here, we can speak
        self.last_spoken_time = current_time
        self.last_message = text
        
        # Clear queue if it's getting too backed up (prioritize new feedback)
        if self.queue.qsize() > 2:
            try:
                while not self.queue.empty():
                    self.queue.get_nowait()
            except queue.Empty:
                pass

        self.queue.put(text)

    def stop(self):
        self.is_running = False
        if self.thread.is_alive():
            self.thread.join(timeout=1.0)
        if self.engine:
            self.engine.stop()
