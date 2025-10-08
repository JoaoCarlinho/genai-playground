    // PromptStateLogic.js
    import { kea } from 'kea';
    import axios from 'axios';
    
    export const counterLogic = kea({
      actions: {
        increment: true,
        decrement: true,
        fetchData: true,
        requestTickerInfo: ((stock_ticker: string) => ({ stock_ticker })) as any,
        requestTickerInfoSuccess: (data) => ({ data }),
        requestTickerInfoFailure: (error) => ({ error }),
        fetchIndexList: true,
        fetchIndexListSuccess: (data) => ({ data }),
        fetchIndexListFailure: (error) => ({ error }),
        fetchDataSuccess: (data) => ({ data }),
        fetchDataFailure: (error) => ({ error }),
        addRagPrompt: (text, prompt_id) => ({ text, prompt_id }),
        addRagResponse: (text, prompt_id) => ({ text, prompt_id }),
        addRagJobResponse: (text, prompt_id) => ({ text, prompt_id }),
        addPromptToChatWindow: (text, prompt_id) => ({ text, prompt_id }),
        resetChat: true,
        createIndex: (index_name, dimensions) => ({ index_name, dimensions }) as any,
        createIndexSuccess: (data) => ({ data }),
        createIndexFailure: (indexError) => ({ indexError }),
        fetchIndexMeta: ((index_name: string) => ({ index_name })) as any,
        fetchIndexMetaSuccess: (data) => ({ data }),
        fetchIndexMetaFailure: (indexMetaError) => ({ indexMetaError }),
        fetchPromptList: true,
        fetchPromptListSuccess: (data) => ({ data }),
        fetchPromptListFailure: (error) => ({ error }),
        addIndexData: (run_chunk, use_case, model_api, index_name, load_path, max_tokens) => ({run_chunk, use_case, model_api, index_name, load_path, max_tokens}),
        addIndexRequestSuccess: (data) => ({ data }),
        addIndexDataRequestFailure: (addindexDataJobError) => ({ addindexDataJobError }),
        addIndexDataSuccess: (data) => ({ data }),
        addIndexDataFailure: (addindexDataJobError) => ({ addindexDataJobError }),
        fetchindexDocumentCount: ((index_name: string) => ({ index_name })) as any,
        fetchindexDocumentCountSuccess: (data) => ({ data }),
        fetchindexDocumentCountFailure: (indexDocumentCountError) => ({ indexDocumentCountError }),
        getPromptWithContextResponseFromPostGres: ((prompt_task_id: string) => ({ prompt_task_id })) as any,
        getPromptWithContextResponseFromPostGresSuccess: (data) => ({ data }),
        getJobsromptResponseFromPostGresFailure: (error) => ({ error }),
        getRAGPromptResponseFromPostGres: ((prompt_task_id: string) => ({ prompt_task_id })) as any,
        getRAGPromptResponseFromPostGresSuccess: (data) => ({ data }),
        getRAGPromptResponseFromPostGresFailure: (error) => ({ error }),
        sendRAGPrompt: (prompt, instructions, prompt_model, vector_search_index_name, embeddings_api, use_case) => ({prompt, instructions, prompt_model, vector_search_index_name, embeddings_api, use_case}),
        sendRAGPromptSuccess: (data: any) => ({ data }),
        sendRAGPromptFailure: (error: any) => ({ error }),
        sendPromptWithContext: (prompt, additional_context, instructions, prompt_model) => ({prompt, additional_context, instructions, prompt_model}),
        sendPromptWithContextSuccess: (data: any) => ({ data }),
        sendPromptWithContextFailure: (error: any) => ({ error }),
        setIndexData: (indexData) => ({ indexData }),
        setDisplayDemo: (displayDemo) => ({ displayDemo }),
        setRAGPromptJobStatus: (promptJobStatus) => ({ promptJobStatus }),
        setPromptWithContextJobStatus: (promptWithContextJobStatus) => ({ promptWithContextJobStatus }),
        setPromptView: (promptView) => ({ promptView }),
        setIndexViewerView: (indexViewerView) => ({ indexViewerView }),
        setIndexViewing: (indexViewing) => ({ indexViewing }),
        setFile: (file) => ({ file }), // Action to set the selected file
        clearFile: true, // Action to clear the selected file
        setUploadFileStatus: (uploadFileStatus) => ({ uploadFileStatus }),
        uploadFile: true,
        uploadFileSuccess: (filename) => ({ filename }),
        uploadFileFailure: (error) => ({ error }),
        fetchFileList: true,
        fetchFileListSuccess: (data) => ({ data }),
        fetchFileListFailure: (error) => ({ error }),
        toggleIndexChat: (recommenderView) => ({ recommenderView }),
        reset: true,
      } as const,
      reducers: ({ actions }) => ({
        jobChatHistory: [
          [] as { sender: 'user' | 'bot', text: string; prompt_id?: number }[],
          {
            // Add a new user prompt
            addPromptToChatWindow: (state, { text, prompt_id }) => [
              ...state,
              { sender: 'user', text, prompt_id }
            ],
            getPromptWithContextResponseFromPostGresSuccess: (state, { data }) => [
            ...state,
            { sender: 'bot', text: data.response_text, prompt_id: data.prompt_id }
            ],
            addRagJobResponse: (state, { text, prompt_id }) => [
              ...state,
              { sender: 'bot', text, prompt_id }
            ],
            // Optionally, reset the chat
            resetChat: () => [],
          }
        ],
        chatHistory: [
          [] as { sender: 'user' | 'bot', text: string; prompt_id?: number }[],
          {
            // Add a new user prompt
            addRagPrompt: (state, { text, prompt_id }) => [
              ...state,
              { sender: 'user', text, prompt_id }
            ],
            // Add a new bot response
            addRagResponse: (state, { text, prompt_id }) => [
              ...state,
              { sender: 'bot', text, prompt_id }
            ],
            getRAGPromptResponseFromPostGresSuccess: (state, { data }) => [
            ...state,
            { sender: 'bot', text: data.response_text, prompt_id: data.prompt_id }
            ],
            // Optionally, reset the chat
            resetChat: () => [],
          }
        ],
        promptWithContextResponseLoading: [
          false,
          {
            getPromptWithContextResponseFromPostGres: () => true,
            getPromptWithContextResponseFromPostGresSuccess: () => false,
            getPromptWithContextResponseFromPostGresFailure: () => false,
          }
        ],
        promptWithContextResponseError: [
          null,
          {
            getPromptWithContextResponseFromPostGresFailure: (_, { error }) => error,
            getPromptWithContextResponseFromPostGres: () => null,
            getPromptWithContextResponseFromPostGresSuccess: () => null,
          }
        ],
        promptResponseLoading: [
          false,
          {
            getRAGPromptResponseFromPostGres: () => true,
            getRAGPromptResponseFromPostGresSuccess: () => false,
            getRAGPromptResponseFromPostGresFailure: () => false,
          }
        ],
        promptResponseError: [
          null,
          {
            getPromptResponseFailure: (_, { error }) => error,
            getRAGPromptResponseFromPostGres: () => null,
            getRAGPromptResponseFromPostGresSuccess: () => null,
          }
        ],
        promptList: [
          [] as any[],
          {
            fetchPromptListSuccess: (_, { data }) => data,
            fetchPromptListFailure: () => [],
          }
        ],
        promptListLoading: [
          false,
          {
            fetchPromptList: () => true,
            fetchPromptListSuccess: () => false,
            fetchPromptListFailure: () => false,
          }
        ],
        promptListError: [
          null as string | null,
          {
            fetchPromptListFailure: (_, { error }) => error,
            fetchPromptList: () => null,
            fetchPromptListSuccess: () => null,
          }
        ],
        fileList: [
          [] as any[],
          {
            fetchFileListSuccess: (_, { data }) => data,
            fetchFileListFailure: () => [],
          }
        ],
        fileListLoading: [
          false,
          {
            fetchFileList: () => true,
            fetchFileListSuccess: () => false,
            fetchFileListFailure: () => false,
          }
        ],
        fileListError: [
          null as string | null,
          {
            fetchFileListFailure: (_, { error }) => error,
            fetchFileList: () => null,
            fetchFileListSuccess: () => null,
          }
        ],
        displayDemo: [
          '',
          {
            setDisplayDemo: (_, { displayDemo }) => displayDemo,
            reset: () => '',
          }
        ],
        indexViewerView: [
          '',
          {
            setIndexViewerView: (_, { indexViewerView }) => indexViewerView,
          }
        ],
        indexViewing: [
          '',
          {
            setIndexViewing: (_, { indexViewing }) => indexViewing,
            fetchindexDocumentCountSuccess: (_, { data }) => data.index_name,
          }
        ],
        promptView: [
          '',
          {
            setPromptView: (_, { promptView }) => promptView,
          }
        ],
        recommenderView: [
          '',
          {
            toggleIndexChat: (_, { recommenderView }) => recommenderView,
          }
        ],
        indexList: [
          [] as any[],
          {
            fetchIndexListSuccess: (_, { data }) => data,
            fetchIndexListFailure: () => [],
          }
        ],
        indexListLoading: [
          false,
          {
            fetchIndexList: () => true,
            fetchIndexListSuccess: () => false,
            fetchIndexListFailure: () => false,
          }
        ],
        indexListError: [
          null as string | null,
          {
            fetchIndexListFailure: (_, { error }) => error,
            fetchIndexList: () => null,
            fetchIndexListSuccess: () => null,
          }
        ],
        indexData: [
          '',
          {
            setIndexData: (_, { indexData }) => indexData,
            reset: () => '',
          }
        ],
        indexDocumentCount: [
          null as number | null,
          {
            fetchindexDocumentCountSuccess: (_, { data }) => data.document_count,
            fetchindexDocumentCount: () => null,
            fetchindexDocumentCountFailure: () => null,
          }
        ],
        count: [
          0,
          {
            [actions.increment]: (state) => state + 1000,
            [actions.decrement]: (state) => state - 75,
          },
        ],
        flaskAvailabilityData: [
          "requested",
          {
            fetchData: () => "awaiting_response",
            fetchDataSuccess: (_, { data }) => data,
            fetchDataFailure: () => "response_failed",
          },
        ],
        indexCreateStatus: [
          false,
          {
            createIndex: () => "awaiting_response",
            createIndexSuccess: (_, { data }) => data,
            createIndexFailure: () => "index_create_failed",
          },
        ],
        indexMetaRequestStatus: [
          false,
          {
            fetchIndexMeta: () => "awaiting_response",
            fetchIndexMetaSuccess: (_, { data }) => data,
            fetchIndexMetaFailure: () => "index_create_failed",
          },
        ],
        addIndexDataRequestStatus: [
          false,
          {
            addIndexData: () => "awaiting_response",
            addIndexDataSuccess: () => "complete",
            addIndexDataFailure: () => "index_create_failed",
          },
        ],
        indexDataJobStatus: [
          false,
          {
            addIndexData: () => "queued",
            addIndexDataSuccess: () => "finished",
            addIndexDataFailure: () => "index_create_failed",
          },
        ],
        promptJobStatus: [
          false,
          {
            sendRAGPrompt: () => "queued",
            sendRAGPromptSuccess: () => "catalogued",
            addIndexDataFailure: () => "index_create_failed",
            setRAGPromptJobStatus: (_, { promptJobStatus }) => promptJobStatus,
            getRAGPromptResponseFromPostGres: () => "retreiving",
            getRAGPromptResponseFromPostGresSuccess: () => "complete",
            getRAGPromptResponseFromPostGresFailure: () => "failed",
          },
        ],
        promptWithContextJobStatus: [
          false,
          {
            sendPromptWithContext: () => "queued",
            sendPromptWithContextSuccess: () => "catalogued",
            sendPromptWithContextFailure: () => "error",
            setPromptWithContextJobStatus: (_, { promptWithContextJobStatus }) => promptWithContextJobStatus,
            getPromptWithContextResponseFromPostGres: () => "retreiving",
            getPromptWithContextResponseFromPostGresSuccess: () => "complete",
            getPromptWithContextResponseFromPostGresFailure: () => "failed",
          },
        ],
        loading: [
          false,
          {
            fetchData: () => true,
            fetchDataSuccess: () => 'complete',
            fetchDataFailure: () => 'failed',
          },
        ],
        indexLoading: [
          false,
          {
            createIndex: () => true,
            createIndexSuccess: () => 'complete',
            createIndexFailure: () => 'failed',
          },
        ],
        indexMetaLoading: [
          false,
          {
            fetchIndexMeta: () => true,
            fetchIndexMetaSuccess: () => 'complete',
            fetchIndexMetaFailure: () => 'failed',
          },
        ],
        indexDataLoading: [
          false,
          {
            addIndexData: () => true,
            addIndexDataSuccess: () => 'complete',
            addIndexDataFailure: () => 'failed',
          },
        ],
        indexDocumentCountLoading: [
          false,
          {
            fetchindexDocumentCount: () => true,
            fetchindexDocumentCountSuccess: () => false,
            fetchindexDocumentCountFailure: () => false,
          }
        ],
        error: [
          null,
          {
            fetchDataFailure: (_, { error }) => error,
            fetchData: () => null,
          },
        ],
        indexError: [
          null,
          {
            createIndexFailure: (_, { indexError }) => indexError,
            createIndex: () => null,
          },
        ],
        indexMetaError: [
          null,
          {
            fetchIndexMetaFailure: (_, { indexMetaError }) => indexMetaError,
            fetchIndexMeta: () => null,
          },
        ],
        addindexDataJobError: [
          null,
          {
            addIndexDataFailure: (_, { addindexDataJobError }) => addindexDataJobError,
            addIndexData: () => null,
          },
        ],
        indexDocumentCountError: [
          null,
          {
            fetchindexDocumentCountFailure: (_, { indexDocumentCountError }) => indexDocumentCountError,
            fetchindexDocumentCount: () => null,
          }
        ],
        selectedFile: [
          null, // Initial state for selectedFile
          {
            setFile: (_, { file }) => file, // Update selectedFile on setFile action
            clearFile: () => null, // Clear selectedFile on clearFile action
          },
        ],
        tickerInfo: [
          '',
          {
            requestTickerInfo: () => '',
            requestTickerInfoSuccess: (_, { data }) => data,
            requestTickerInfoFailure: () => '',
          }
        ],
        tickerInfoLoading: [
          false,
          {
            requestTickerInfo: () => true,
            requestTickerInfoSuccess: () => false,
            requestTickerInfoFailure: () => false,
          }
        ],
        tickerInfoError: [
          null,
          {
            requestTickerInfoFailure: (_, { error }) => error,
            requestTickerInfoSuccess: () => null,
            requestTickerInfo: () => null,
          }
        ],
        uploadFileStatus: [
          null,
          {
            uploadFile: () => "requested",
            uploadFileSuccess: () => "uploaded",
            uploadFileFailure: () => "failed",
            setUploadFileStatus: (_, { uploadFileStatus }) => uploadFileStatus,
          }
        ]
      }),
      listeners: ({ actions, values }) => ({
        [actions.fetchData]: async () => {
            const response = await axios.get('http://localhost:5005')
            .then((response) => {
              actions.fetchDataSuccess(response.data);
            })
            .catch((error) => {
              actions.fetchDataFailure(error);
            })
        },
        [actions.createIndex]: async ({index_name, mapping_type, dimensions}) => {  
          const response = await axios.post('http://localhost:5005/create-index', {
            index_name: index_name,
            dimensions: parseInt(dimensions),
            mapping_type: mapping_type,
            elastic_user: 'elastic',
            elastic_password: 'hjfkljgh9765'
          })
            .then((response) => {
              actions.createIndexSuccess(response.data);
            })
            .catch((error) => {
              actions.createIndexFailure(error);
            })
        },
        [actions.fetchIndexMeta]: async ({index_name}) => {  
          const response = await axios.get('http://localhost:5005/get-index-meta', {
            params: {
              index_name: index_name,
              elastic_user: 'elastic',
              elastic_password: 'hjfkljgh9765'
          }
          })
            .then((response) => {
              actions.fetchIndexMetaSuccess(response.data);
            })
            .catch((error) => {
              actions.fetchIndexMetaFailure(error);
            })
        },
        [actions.addIndexData]: async ({run_chunk, use_case, model_api, index_name, load_path, max_tokens}) => {  
          const response = await axios.get('http://localhost:5005/add-to-index', {
            params: {
              run_chunk: run_chunk,
              use_case: use_case,
              model_api: model_api,
              load_path: load_path,
              index_name: index_name,
              max_tokens: max_tokens,
              elastic_user: 'elastic',
              elastic_password: 'hjfkljgh9765'
          }
          })
            .then((response) => {
              actions.addIndexDataRequestSuccess(response.data);
            })
            .catch((error) => {
              actions.addIndexDataRequestFailure(error);
            })
        },
        [actions.fetchindexDocumentCount]: async ({index_name}) => {
          await axios.get('http://localhost:5005/get-index-count', {
            params: {
              index_name: index_name,
              elastic_user: 'elastic',
              elastic_password: 'hjfkljgh9765'
            }
          })
            .then((response) => {
              console.log(Object.keys(response.data));
              actions.fetchindexDocumentCountSuccess(response.data);
            })
            .catch((error) => {
              actions.fetchindexDocumentCountFailure(error);
            });
        },
        [actions.sendRAGPrompt]: async ({ prompt, instructions, prompt_model, vector_search_index_name, embeddings_api, use_case }) => {
          await axios.post('http://localhost:5005/compare', {
            prompt: prompt,
            instructions: instructions,
            prompt_model: prompt_model,
            vector_search_index_name: vector_search_index_name,
            embeddings_api: embeddings_api,
            use_case: use_case
          })
            .then((response) => {
              actions.sendRAGPromptSuccess(response.data);
            })
            .catch((error) => {
              actions.sendRAGPromptFailure(error);
            });
        },
        [actions.sendPromptWithContext]: async ({ prompt, additional_context, instructions, prompt_model }) => {
          await axios.post('http://localhost:5005/get-context-aided-support', {
            prompt: prompt,
            additional_context: additional_context,
            instructions: instructions,
            prompt_model: prompt_model,
          })
            .then((response) => {
              actions.sendPromptWithContextSuccess(response.data);
            })
            .catch((error) => {
              actions.sendPromptWithContextFailure(error);
            });
        },
        [actions.getRAGPromptResponseFromPostGres]: async ({ prompt_task_id }, breakpoint, logic) => {
          try {
            console.log("Fetching prompt response from Postgres for prompt_id:", prompt_task_id);
            const response = await axios.get('http://localhost:5005/get-prompt-response', {
              params: { prompt_task_id }
            });
            actions.getRAGPromptResponseFromPostGresSuccess(response.data);
          } catch (error) {
            actions.getRAGPromptResponseFromPostGresFailure(error);
          }
        },
        [actions.fetchIndexList]: async (_, breakpoint, logic) => {
          try {
            const response = await axios.get('http://localhost:5005/list-indices');
            actions.fetchIndexListSuccess(response.data);
          } catch (error) {
            actions.fetchIndexListFailure(error);
          }
        },
        [actions.fetchPromptList]: async (_, breakpoint, logic) => {
          try {
            const response = await axios.get('http://localhost:5005/list-prompts');
            actions.fetchPromptListSuccess(response.data);
          } catch (error) {
            actions.fetchPromptListFailure(error);
          }
        },
        [actions.fetchFileList]: async (_, breakpoint, logic) => {
          try {
            const response = await axios.get('http://localhost:5005/files');
            console.log(`file info received ${JSON.stringify(response.data)}`)
            actions.fetchFileListSuccess(response.data);
          } catch (error) {
            actions.fetchFileListFailure(error);
          }
        },
        [actions.requestTickerInfo]: async ({stock_ticker}) => {
          try {
            console.log("Fetching ticker info for:", stock_ticker);
            const response = await axios.get('http://localhost:5005/get-ticker-info', {
              params: { stock_ticker }
            });
            console.log(`ticker info received ${JSON.stringify(response.data)}`)
            actions.requestTickerInfoSuccess(response.data);
          } catch (error) {
            actions.requestTickerInfoFailure(error);
          }
        },
        [actions.requestTickerInfo]: async ({stock_ticker}) => {
          try {
            console.log("Fetching ticker info for:", stock_ticker);
            const response = await axios.get('http://localhost:5005/get-ticker-info', {
              params: { stock_ticker }
            });
            console.log(`ticker info received ${JSON.stringify(response.data)}`)
            actions.requestTickerInfoSuccess(response.data);
          } catch (error) {
            actions.requestTickerInfoFailure(error);
          }
        },
        [actions.uploadFile]: async () => {
          try {
            const formData = new FormData();
            if (!values.selectedFile) {
              actions.uploadFileFailure('No file selected.');
              return;
            }
            formData.append('file', values.selectedFile);
              const response = await axios.post('http://localhost:5005/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            })
              console.log(`upload file  response ${JSON.stringify(response.data)}`)
              actions.uploadFileSuccess(response.data.filename);
          } catch (error) {
            actions.uploadFileFailure(error);
          }
        },
      }),
      selectors: {
        fileName: [
          (s) => [s.selectedFile], 
          (selectedFile: { name: any; }) => (selectedFile ? selectedFile.name : 'No file selected'),
        ],
      }
    });